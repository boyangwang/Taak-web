# User interaction

"Pull down" to sync/refresh (as seen on twitter). Alternatively synchronization can be performed by button pressed.

	See: 
	http://stackoverflow.com/questions/7306328/pull-down-to-refresh-on-mobile-web-browser
	https://github.com/funayoi/jquery.mobile.pulltorefresh

Synchronization will be automatically triggered when the "online" event on the Window object is triggered, or when the user refreshes the application.

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

1. Client pulls server copy using GET
2. Performs synchronization procedure, and updates its own copy
3. Performs relevant PUT/DELETE requests to update copy on server

## Synchronization procedure

Both local and server side sets are merged into one larger set. Each entry in the merged set is then compared with that on the server side. 

Algorithm for merging (similar to the merging algorithm for merge sort):

	1. Treat both sets as a queue. Sort both queues by ID. Looking at the head/tail of the queue, we check for the following cases:
		a. IDs from both are different
			We add the one with the lowest/highest ID to the merged set (lowest if sort IDs from low to high, highest if sort the opposite way). The other one that is not yet added would be put back to the queue in case later entries may match. 
		b. IDs from both are the same
			We add the one with the later last modified time, and delete the one that is not added.
	2. The resulting items will contain only the latest copies of all entries.
			
The merged set is then compared to the server copy. There are several cases that a certain entry can belong to:

	1. The entry does not exist on server copy
	 		This entry is new. Queue the entry for PUT.
	2. The entry's last modified time is the same for both
			This entry is unchanged. Do nothing.
	3. The entry's last modified time is newer than the server copy
			This entry is modified. Queue the entry for PUT.
			If the entry value is an empty string, queue the entry for DELETE.

The PUT and DELETE queues are converted to a PUT or DELETE transaction and sent to the server.

We do not need to consider if the server's copy is newer than the client's copy, because that scenario is already considered when using the merging algorithm. The merged set will contain the newest entries from both sides.

The local copy will treat entries with value equal to empty strings as deleted entries.

Semi-deleted entries can be deleted from client side **after** synchronization. 

On the server-side, all deleted entries will be retained, but their values set to empty strings (so they do not contain user data). This is for synchronization purposes.

The client can perform "short-circuiting". In other words, the effects of add/modify/delete will appear immediately, without needing to wait for server response. Even if the update to the server is interrupted, synchronization can be performed again without any data loss, since the entire set of entries is compared.

# Server API

Server will reply with JSON data for all cases.

## About the Authentication Token

The token should be usable even after the app is closed. This is to improve user experience because the user do not need to log in again.

Logging out will remove the token (and maybe invalidate it so it cannot be replayed).

The server should be able to translate tokens to the relevant user ID.

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

	code: Message code
	message: Message indicating what entries are modified

All entries will be inserted. Entries that already exist will be replaced.
This is a general purpose query, and can also be used for "deleting" entries (set value of the entry to an empty string).

## DELETE

Parameters:

	type: An extra sub-class of the action (for future extension)
	entries[]: An array of entries to perform the action on. Each entry has the data format stated the the "Data format" section.
	token: Authentication token

Response:

	code: Message code
	message: Message indicating what entries are deleted

All entries will be removed. Only the Id parameter of each entry will be looked at.

Entry value will be set to an empty string, rather than actually deleted. The reason is so that synchronization does not accidentally re-add the same entry on the server.