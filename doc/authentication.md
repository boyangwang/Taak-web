Taak currently uses OAuth for authentication.

## Authentication procedure

1. User clicks on a direct login link to Facebook. The redirect URL points to `oauth.php`. 
2. Facebook will respond with a one-time use code. `oauth.php` will pass this code along with our app id, app secret, and the redirect URL to Facebook, which will then reply with the token. This is done in PHP.
3. The token is then used for querying the user's profile, where we can obtain the user's id. This is done in `oauth.php` in PHP (originally done in JavaScript).
4. Both token and user id are stored into the database. The token and id is outputted to the user as JavaScript and stored into localStorage.

Changes from original authentication system

	No longer use "debugtoken" from graph API (which is meant for developer use). Standard API calls like "me" and "oauth/accesstoken" are used.
	More secure initial login since one-time code is used for initial authentication instead of token.
	User id is saved to database, and this id is the same when user logs in on another device using the same account.
	No intermediate AJAX call used for initial authentication
	PHP is used in initial authentication

## Authentication of user

This is typically performed when doing a REST query.

1. The user sends both user id and token.
2. Server takes token and perform a look-up in the `user` table to find the user id associated with it
3. If no match, access is denied.
4. If there is a match, but user id obtained from table is different from that supplied from user, access is denied
5. Else, access is granted

The server do not need to perform any further communication with Facebook. This allows the token to be long-lived (even after expiry on Facebook), so the user only needs to log in once.

## Revocation of token

The server simply deletes the entry related to this token. The user will need to log in again.
