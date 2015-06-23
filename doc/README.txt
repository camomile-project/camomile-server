# from within the doc directory
bundle install
bundle exec middleman build --clean
./ghp-import -p build
