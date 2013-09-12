# User interaction

"Pull down" to sync/refresh (as seen on twitter). Alternatively synchronization can be performed by button pressed.

	See: 
	http://stackoverflow.com/questions/7306328/pull-down-to-refresh-on-mobile-web-browser
	https://github.com/funayoi/jquery.mobile.pulltorefresh

Synchronization will be automatically triggered when the "online" event on the Window object is triggered.

# Technical details

## Data format

Data format:

	ID - ID of entry.
	TimeStamp - Time this entry was last modified, set by client.
	Value - Data corresponding to the entry. Empty string indicates a deleted entry.
	Sync - Boolean flag indicating if the entry is synchronized (client only).

ID is generated using the following formula:

	ID = Time ID is generated + "_" + Client Seed + "_" + counter

This allows for unique IDs to be generated even by offline clients.  

## Performing synchronization

1. Client pulls server copy
2. Performs synchronization procedure, updating its own copy
3. Performs relevant PUT/UPDATE/DELETE requests to update copy on server

## Synchronization procedure

For each entry compare with that of server

	1. The entry value on the server copy is an empty string
		Entry is deleted on server. This entry with this Id will be removed from client
	2. The server does not have it
		Entry should be added to server. Queue a PUT request for this entry.
	3. The TimeStamp for local copy is newer than server copy
		Entry should be updated on server. Queue a UPDATE request for this entry.
		If this entry value is an empty string, queue a DELETE request instead.
	4. The TimeStamp for local copy is older than server copy
		Entry should be updated on local.
	5. The TimeStamp for both copies is the same
		Do nothing. The entry is already the latest copy.

Alternatively

	1. Sort entries by ID on both sides.
	2. Entries from both sides are merged (in merge-sort fashion).
		For entries with the same ID, pick the one with the latest time stamps.
	3. Finally, compare with the server copy and perform UPDATE on all the entries that are different.

Note that the local copy will treat entries with value equal to empty strings as deleted entries.

Semi-deleted entries will be deleted from client side after synchronization.

On the server-side, all deleted entries will be retained, but their values set to empty strings (so they do not contain user data). This is for synchronization purposes.

# Server API

Server will reply with JSON data for all cases.

## About the Authentication Token

The token should be usable even after the app is closed. This is to improve user experience because the user do not need to log in again.

Logging out will remove the token (and maybe invalidate it so it cannot be replayed).

## GET

Parameters:

	type: An extra sub-class of the action (for future extension)
	token: Authentication token

Response:

	entries[]: Array of entries

Gets all entries belonging to a user. This is typically used for synchronization.

## POST

Parameters:

	user: User name
	mac: Message authentication code (SHA digest of password with HMAC)
	time: Time the message was sent (use for preventing replay attack)

Response:

	token: Authentication token (optional)
	message: Message for response

Server returns an authentication token that can be used for GET/PUT/DELETE on successful login.
Otherwise, it returns an error message.

## PUT

Parameters:

	type: An extra sub-class of the action (for future extension)
	entries[]: An array of entries to perform the action on. Each entry has the data format stated the the "Data format" section.
	token: Authentication token

Response:

	message: Message indicating success or failure

All entries will be inserted. Entries that already exist will be replaced.
This is a general purpose query, which can also be used for "deleting" entries (set value to empty string).

## DELETE

Parameters:

	type: An extra sub-class of the action (for future extension)
	entries[]: An array of entries to perform the action on. Each entry has the data format stated the the "Data format" section.
	token: Authentication token

Response:

	message: Message indicating success or failure

All entries will be removed. Only the Id parameter of each entry will be looked at.

Entry value will be set to an empty string, rather than actually deleted. The reason is so that synchronization does not accidentally re-add the same entry on the server.