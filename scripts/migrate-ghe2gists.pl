#!/usr/bin/perl
#
# perl migrate.pl /shared/ghe/backup/current /data/rcloud/data/gist-service

use File::Path qw(mkpath);

$backup=shift;
$dest=shift;
$opt=shift;

$cmd = "cp -pr";
if ($opt eq '-mv') { $cmd = "mv"; }

if ($backup eq '' || $dest eq '') {
    print "\n Usage: migrate-ghe2gists.pl <GHE-backup-directory> <gist-service-data> [-mv]\n\n";
    exit 1;
}

print STDERR "INFO: loading users ...\n";
## 1st pass - parse users -- they are at the end and we need them first
## so we need two passes
open IN, "gzip -dc \"$backup/mysql.sql.gz\"|";
while (<IN>) {
    if (/^INSERT INTO `users` VALUES /) {
        s/^INSERT INTO `users` VALUES \(//;
        s/\)$//;
        @a = split /\),\(/;
        foreach (@a) {
            #print "SRC> $_\n";
            s/'//g;
            @x = split /,/;
            $login[$x[0]] = $x[1];
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
        @a = split /\),\(/;
        foreach (@a) {
            #print "SRC> $_\n";
            s/'//g;
            ($id, $user, $repo, $desc, $public, $created_at, $updated_at, $parent) = split /,/;
            $desc =~ s/^0x//;
            $desc = pack 'H*', $desc;
            $user_name = $login[$user];
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
open IN, "gzip -dc \"$backup/mysql.sql.gz\"|";
while (<IN>) {
    ## id, body, gist_id, user_id, created, updated
    if (/^INSERT INTO `gist_comments` VALUES /) {
        s/^INSERT INTO `gist_comments` VALUES \(//;
        s/\)$//;
        ## to avoid quoting hell, convert all escapes \' into &#39
        s/\\'/&#39/g;
        @a = split /\),\([0-9]+,'/;
        foreach (@a) {
            if (/^(.*?)',/) {
                $txt = $1;
                s/^(.*?)',//;
                s/\'//g;
                @b = split /,/;
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
@paths = glob "$backup/repositories/?/??/??/??/gist/*.git";

print STDERR "INFO: migrating repos ...\n";
foreach (@paths) {
    $id = $src = $_;
    $id =~ s:.*/::;
    $id =~ s/\.git$//;
    $path = $id;
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
