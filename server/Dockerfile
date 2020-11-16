FROM php:7.4-apache
EXPOSE 80/tcp
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get -y install wget git zip unzip cron sqlite3 libsqlite3-dev
RUN docker-php-ext-install pdo pdo_sqlite
RUN wget --content-disposition https://getcomposer.org/composer-2.phar
COPY . /var/www/html
RUN php composer.phar install 
#cronjobs
# Copy hello-cron file to the cron.d directory
COPY scheduled/cron_table /etc/cron.d/cron_table
# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/cron_table
# Apply cron job
RUN crontab /etc/cron.d/cron_table
# Create the log file to be able to run tail
RUN touch /var/log/cron.log
# Run the command on container startup
CMD . ./initialize.sh