# Database

Database version: MySQL 5

Expected Database name: deployas3

# Schema

## Entries

Table name is "entries". This table is used by api.php.

	PRIMARY VARCHAR(255) id
	TEXT user
	TEXT value
	
## User

Table name is "users". This table is currently unused.

	PRIMARY VARCHAR(255) id
	TEXT realid
	TEXT token