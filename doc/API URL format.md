# Entry API

The Entry API is used for online storage of entries. The server responses are in JSON format.

## Collections

Collections refers to multiple Entry resources. Typically a user will have one collection of Entry resources.

	Path: [APP]/api/entry/[user id]/
	Translated: [APP]]/api.php?action=entry&userid=[user id]

### GET request

GET will return a collection of entries related to the user id.
This request accepts the following parameters:

	token: Authentication token. Server translates this to [user id] for user verification.

The query will generate the following response:

	Entry[]: Array of Entry objects.
	
### PUT request

PUT can insert or modify multiple entries.
This request accepts the following parameters:

	token: Authentication token.
	entries: Array of Entry objects.
	time: Echo value.

The query will generate the following response:

	code: Result code.
	message: Information related to the code
	time: Value taken from the time parameter

### DELETE request

DELETE can remove multiple entries.
This request accepts the following parameters.

	token: Authentication token.
	entries: Array of Entry objects.
	time: Echo value.

The query will generate the following response:

	code: Result code.
	message: Information related to the code.
	time: Value taken from the time parameter.

## Individual

The API supports requests for individual entries.

	Path: [APP]/api/entry/[user id]/[entry id]
	Translated: [APP]]/api.php?action=entry&userid=[user id]&entryid=[entry id]

### GET request

GET will return an of entries related to the user id and the entry id.
This request accepts the following parameters:

	token: Authentication token. Server translates this to [user id] for user verification.

The query will generate the following response:

	Entry: An Entry object.
	
### PUT request

PUT can insert or modify a single entry.
This request accepts the following parameters:

	token: Authentication token.
	entry: Target entry object.
	time: Echo value.

The query will generate the following response:

	code: Result code.
	message: Information related to the code.
	time: Value taken from the time parameter.

### DELETE request

DELETE can remove an entry.
This request accepts the following parameters.

	token: Authentication token.
	entry: Target entry object.
	time: Echo value.

The query will generate the following response:

	code: Result code.
	message: Information related to the code.
	time: Value taken from the time parameter.

# Application version

This part of the API will return the latest version number for the client. Version number is specified in "js/client.js" and "version.txt".

	Path: [APP]/api/version
	Translated: [APP]/version.txt