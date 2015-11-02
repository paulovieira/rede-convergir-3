#!/bin/bash
	
for file in database/sql/*.sql
do
	echo ""
	echo "		***********************************************************"
	echo "			Executing " $file
	echo "		***********************************************************"
#	psql --dbname $1 --file="$file" --log-file=prepare_database.log
	$HOME/postgres9.5/bin/psql --dbname $1 --file="$file" 
#	$HOME/postgres9.5/bin/psql --version
done
