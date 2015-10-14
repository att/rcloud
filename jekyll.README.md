# Installing Jekyll Locally for Testing

The main advantage of using Jekyll for static sites is that it understands markup and templates. The documentation was originally written in markup, so it's easier (although not better) to keep using it.

1. Install Ruby, version 2+. On macs, this is already installed.
1. Install the Bundler package manager for Ruby. `gem install bundler`
1. Create a new file called "Gemfile" in the repository root (/Users/username/Sites/Gemfile on a mac). On separate lines, add:
    a. `source 'https://rubygems.org'`
    b. `gem 'github-pages'`
1. Check out the rcloud pages site to ~/Sites:
    a. `git clone https://github.com/att/rcloud.git`
    b. `cd rcloud`
    c. `git checkout origin/gh-pages -b gh-pages`
1. cd rcloud
1. _layouts contains the templates for the site. Copy this directory to ~/Sites. Also copy _config.yml to ~/Sites.
1. Go to ~/Sites and run `bundle exec jekyll serve`. This needs doing every time you want to rebuild the website (i.e. whenever you make a change)
1. The site will be available on localhost:4000.

After making changes:

1. `git config --global --edit`: Lets you set the user and email git should use to push changes.
1. `git status`: Tells you what git thinks is new, has changed, has been deleted, etc.
1. `git push -u origin gh-pages`: pushes your changes to the master repository.


 
