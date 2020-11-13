#!/bin/bash
./vendor/bin/phpunit --log-junit build/logs/junit.xml --coverage-clover build/logs/clover.xml --whitelist ./API test
