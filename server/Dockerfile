FROM php:7.4-apache
EXPOSE 80/tcp
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get -y install wget git zip unzip cron sqlite3 libsqlite3-dev
RUN apt-get install -y msmtp-mta && apt-get clean
RUN docker-php-ext-install pdo pdo_sqlite
RUN wget --content-disposition https://getcomposer.org/composer-2.phar
COPY . /var/www/html
RUN php composer.phar install --no-dev
#cronjobs
# Copy hello-cron file to the cron.d directory
COPY scheduled/cron_table /etc/cron.d/cron_table
# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/cron_table
# Apply cron job
RUN crontab /etc/cron.d/cron_table
# Create the log file to be able to run tail
RUN touch /var/log/cron.log
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"
RUN chown www-data:www-data -R /var/www/html
# Email configuration
COPY ./configs/msmtprc.tmpl /msmtprc.tmpl
RUN curl -L https://github.com/hairyhenderson/gomplate/releases/download/v2.3.0/gomplate_linux-amd64-slim > /usr/local/bin/gomplate && \
  chmod u+x /usr/local/bin/gomplate
RUN echo 'sendmail_path = "/usr/sbin/sendmail -t"' > /usr/local/etc/php/conf.d/mail.ini
ENV SSMTP_HOST=mailserver
ENV SSMTP_PORT=1025
ENV SSMTP_FROM=noreply@polito.it
ENV SSMTP_USE_TLS=off
ENV SSMTP_USE_STARLTLS=off
ENV SSMTP_AUTH_USER=francexi@hotmail.it
ENV SSMTP_AUTH_PASSWORD=testpass

# Run the command on container startup
CMD . ./initialize.sh