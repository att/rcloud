#!/usr/bin/perl
use strict;
#use warnings;

#
# perl migrate.pl /shared/ghe/backup/current /data/rcloud/data/gist-service

use File::Path qw(mkpath);
use Getopt::Long 'HelpMessage';

my %users;

# declare the perl command line flags/options we want to allow
GetOptions(
  'users=s' => \my $filename,
  'cmd=s'   => \my $cmd,
  'h'       => \my $help
) or HelpMessage(1);

if ($help == 1)
{
  HelpMessage(1);
}


=head1 NAME

license - get license texts at the command line!

=head1 SYNOPSIS

  --users         Users list file name (optional)
  --help,-h       Print this help
  --cmd		  Command defaults to 'cp -pr'

  Example:
    perl migrate.pl /shared/ghe/backup/current /data/rcloud/data/gist-service

=head1 VERSION

0.01

=cut

if ($filename ne "")
{
  print "filename=$filename\n";
}

####################################`
sub read_users_file()
{
  my ($filename) =@_;
  print "Filename = $filename\n";
  
  open(USERS, $filename) or die("Could not open  file $filename\n\n");

  foreach my $line (<USERS>)  
  {   
    chomp($line); 
    if(length($line) > 1)
    {
      $users{$line}=$line;
    }
  }

  print "USERS LIST:\n";
  foreach my $u (sort keys %users)
  {
    print "'$users{$u}'\n";
  }
  close(USERS);
}

###################################

my $backup=shift;
my $dest=shift;


if ($filename ne "")
{
  &read_users_file($filename);
}

if ($cmd eq '') 
{ 
  $cmd = "cp -pr"; 
}
# print "cmd= $cmd\n\n";


if ($backup eq '' || $dest eq '') {
    print "\n Usage: migrate-ghe2gists.pl <GHE-backup-directory> <gist-service-data> [-mv]\n\n";
    exit 1;
}

print STDERR "INFO: loading users ...\n";
## 1st pass - parse users -- they are at the end and we need them first
## so we need two passes
open IN, "gzip -dc \"$backup/mysql.sql.gz\"|";
my @login;
my @email;
my %json;
my %gist_id;
my %id2repo;
my %parent_gid;
my %forks;

while (<IN>) {
    if (/^INSERT INTO `users` VALUES /) {
        s/^INSERT INTO `users` VALUES \(//;
        s/\)$//;
        my @a = split /\),\(/;
        foreach (@a) {
            #print "SRC> $_\n";
            s/'//g;
            my @x = split /,/;
            $login[$x[0]] = lc($x[1]);
            $email[$x[0]] = $x[32];
        }
    }
}
close IN;

print STDERR "INFO: loading gists ...\n";
## 2nd pass - parse gists
open IN, "gzip -dc \"$backup/mysql.sql.gz\"|";
while (<IN>) {
    if (/^INSERT INTO `gists` VALUES /) {
        s/^INSERT INTO `gists` VALUES \(//;
        s/\)$//;
        my @a = split /\),\(/;
        foreach (@a) {
            #print "SRC> $_\n";
            s/'//g;
            my ($id, $user, $repo, $desc, $public, $created_at, $updated_at, $parent) = split /,/;
            $desc =~ s/^0x//;
            $desc = pack 'H*', $desc;
            my $user_name = $login[$user];

            if ($filename ne "")
            {
              if (! exists $users{$user_name}) 
              {
                ###print __LINE__, ": User $user_name is NOT of interest\n";
                next;
              }
            } 

            $public = ($public == 0) ? 'false' : 'true';
            $desc =~ s/\\/\\\\/g;
            $desc =~ s/"/\\"/g;
            $created_at =~ s/$/Z/;
            $updated_at =~ s/$/Z/;
            $created_at =~ s/ /T/;
            $updated_at =~ s/ /T/;
            $json{$repo} = "{\"id\":\"$repo\",\"owner\":\"$user_name\",\"description\":\"$desc\",\"public\":$public,\"created_at\":\"$created_at\",\"updated_at\":\"$updated_at\""; ## it's missing } because we have to add forks and fork_of
            $gist_id{$repo} = $id;
            $id2repo{$id} = $repo;
            $parent_gid{$repo} = $parent;
            $forks{$parent} .= ",{\"id\":\"$repo\"}";
        }
    }
}
close IN;

print STDERR "INFO: loading comments ...\n";
## 3rd - parse comments

my %commid;
my %comm;

open IN, "gzip -dc \"$backup/mysql.sql.gz\"|";
while (<IN>) {
    ## id, body, gist_id, user_id, created, updated
    if (/^INSERT INTO `gist_comments` VALUES /) {
        s/^INSERT INTO `gist_comments` VALUES \(//;
        s/\)$//;
        ## to avoid quoting hell, convert all escapes \' into &#39
        s/\\'/&#39/g;
        my @a = split /\),\([0-9]+,'/;
        foreach (@a) {
            if (/^(.*?)',/) {
                my $txt = $1;
                s/^(.*?)',//;
                s/\'//g;
                my @b = split /,/;
                $commid{$b[0]}++;
                my $cid = $commid{$b[0]};
                my $t1 = $b[2]; $t1 =~ s/ /T/; $t1 .= 'Z';
                my $t2 = $b[3]; $t2 =~ s/ /T/; $t2 .= 'Z';
                $comm{$b[0]} .= "{\"url\":null,\"id\":$cid,\"user\":{\"login\":\"$login[$b[1]]\"},\"body\":\"$txt\",\"created_at\":\"$t1\",\"updated_at\":\"$t2\"},";
            }
        }
    }
}
close IN;


print STDERR "INFO: finding all repos ...\n";
my @paths = glob "$backup/repositories/?/??/??/??/gist/*.git";

print STDERR "INFO: migrating repos ...\n";
foreach (@paths) 
{
    my $src = $_;
    my $id = $_;
#    print __LINE__, ": migrating repos id = $id\n";

    $id =~ s:.*/::;
    $id =~ s/\.git$//;
    my $path = $id;
    $path =~ s:^(.)(.)(.)(.*)$:\1/\2/\3/\4:;
    $path = "$dest/$path";
    print "$id --> $src\n   ";
    if ($json{$id} eq '') {
        print STDERR "WARN: unknown gist $id\n";
    } else {
        mkpath "$path";
        my $res = system "$cmd \"$src\" \"$path/repo\"";
        if ($res != 0) {
            die "ERROR: copy failed: $id\n$src\n";
        }
        my $j = $json{$id};
        my $parent = $parent_gid{$id};
        ## need to append fork_of and forks as we need all gists loaded for that
        if ($parent > 0 && $id2repo{$parent} ne '') {
            $j .= ",\"fork_of\":{\"id\":\"$id2repo{$parent}\"}";
        }
        my $gid = $gist_id{$id};
        my $f = $forks{$gid};
        $f =~ s/^,//;
        $j .= ",\"forks\":[$f]}\n";
        print $j;
        open OUT, ">$path/gist.json";
        print OUT $j;
        close OUT;
        mkdir "$path/comments";
        if ($comm{$gid} ne '') {
            my $c = $comm{$gid};
            $c =~ s/^,//;
            $c =~ s/,$//;
            open OUT, ">$path/comments/comments.json";
            print OUT '['.$c."]\n";
            close OUT;
        }
    }
}
