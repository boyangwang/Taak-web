===========================================================================
######PB:3:0x, LD:4:0x, SD:3:0x, UX:3:0x, JS:1:0x
######Type:Total:Completed x RemainingFast Med Slow

===========================================================================
###App Goals & Corresponding Features
Insert comments with `$yourname: and then backticks`.

####App Goals
* Every morning, when I open the app, I just want to see what I need to do today. That's it.
* I don't want to spend time rearranging to-do tasks.

####Fast & Easy User Input
#####Autocomplete for common actions:
* Info:: Ask, Tell, Check, Call, Email,  
* Things:: Bring, Take, Buy, Sell, Download, Upload,  
* Create:: Write, Code, Make, [Bake, …]  

####Quick & Easy List Management
#####Just See Everything You Need, Without Manually Arranging
* Inputs for priority:: Four Quadrants, Association Tags (eg Family, Work, Friends), Deadline
* Inputs for retention:: Frequency Tag (Daily, Fortnightly)
* Priority Rules for Association Tags
* Priority Calculation & Sorting based on above

#####How Often Do You Perform These Actions
We really need to ask existing users of to-do list apps on how often they use these actions. Because it affects which actions we are going to save our tap actions for… eg should we make users tap "edit" first before you can do that action.

* Sort
* Clear A Task
* Clear Multiple Tasks

#####Introspection of Existing To-Do Task Apps
It would be good if we can have a list of existing to-do apps and look at what they do.

Chenliang looking at

* Tomorrow (iOS i think)

Remaining

* AnyList
* Any.Do
* RTM (Remember the Milk)
* Orchestra
* Wunderlist

#####Quick Taps for List Management
* Sort:: One Tap, Drag, and Drop
	* Tap -> Entry Highlighted -> User can move it around
* Double tap to view more details
* Tap middle to clear task
* Tap left to clear and indicate that task took a longer time than intended
* Tap right to clear and indicate that task took a shorter time than intended

#####Keep Long Tasks in Mind
* Reverse: Out of sight out of mind
* Keep tasks that take multiple days in view.
* Perhaps as a small floating div at the bottom of app, taking the last two rows.
* Can be hidden with a "double-down" arrow at floating div's top right corner
* Can be shown again with a "double-up" arrow.
* Regardless of hide/show the floating div will reappear the next day.

#####Bring Over Uncleared Tasks
* Remembers uncleared tasks from previous day
* Brings them over automatically
* Uncleared tasks for a few days become increasingly bolded and red, with number of days past indicated

####Syncing
Indicator of whether you are Offline or Online  

####Analytics
* Log of your most productive times (capture done time) and places (geolocation)

===========================================================================
###Phase 1

####Milestone 0: @@PB  
Describe the problem that your application solves.

@@@
We want to make it easy for people to maintain and keep ahead of their daily routines and to-do tasks.

There are many people who have busy schedules with many to-do tasks to track, and often use sticky notes to help manage these tasks.

Although sticky notes work very well as to-do task planners and reminders, but they aren't conveniently portable. You can't exactly carry your physical sticky notes board around with you.

Hence we wanted to create an app that makes sticky notes mobile.

We also want to make the app a personal to-do tracker for a party of one, because very often, you just want to in one glance know what you need to do, instead of using some app where it is cluttered with other people's to-dos or some app where you have to click through numerous places just to see what you need to do.


####Milestone 1: @@PB
Describe your application and explain how you intend to exploit the characteristics of mobile cloud computing to achieve your application’s objectives, i.e. why does it make most sense to implement your application as a mobile cloud application?

@@@
It should be a mobile application because you need to be able to refer to your to-do stick notes on the go, any time anywhere.
It should use the cloud because many interactions happen online and you need to be able to sync those online interactions and to-do tasks into the app.
Another reason is that you should be able to access your data on any device, without having to manually transfer your data, since this syncing can be better done via the cloud.

####Milestone 2: @@PB
Describe your target users. Explain how you plan to promote your application to attract your target users.

@@@ Our target users are university students and young working adults who have busy schedules with many to-do tasks to track, and wished that their their to-do list could manage itself, without much manual intervention or rearrangement.
@@@ There are 3 main ways that we can promote the app.
@@@ First, we can allow users to share their schedules and allow other people to add tasks to their schedules. This increases exposure of the app to other people.
@@@ Second, some awesome features are unlockable only after you have invited X number of friends who use the app, which gives the user an incentive to invite more friends.
@@@ Third, further promotion can be done through Facebook/Twitter/Tumblr shares.

####Milestone 3: Pick a name for your mobile cloud application. (Not graded).
Taak
(Boyang: Taak is "task" in Dutch)

####Milestone 4: @@LD
Draw the database schema of your application.

@@@
Table: Entries
PRIMARY VARCHAR(255) Id
TEXT user
TEXT value
[image on google doc]

####Milestone 5: @@SD
Design and document (at least 3) most prominent requests of your REST API. The documentation should describe the requests in terms of the triplet mentioned above. Do provide us with a brief explanation on the purpose of each request for reference. Also, explain how your API conforms to the REST principles and why you have chosen to ignore certain practices(if any).

===========================================================================
###Phase 2

####Milestone 6: @@SD
Tell us some of the more interesting queries (at least 3) in your application that requires database access. Provide the actual SQL queries you used.

@@@
1. Putting entries into the database
SQL: INSERT INTO entries(id, user, value) VALUES($id, $user, $value) ON DUPLICATE KEY UPDATE value=$value
This query updates an existing value or adds the entry if it does not exist. It is more efficient than deletion followed by insertion, or checking if the entry exists then choosing update or insertion.
2. “Deletion” of entries
SQL: UPDATE entries SET value='' WHERE id=$id
This query sets the value of an entry to an empty string. The value is typically a JSON string, thus by setting it to an empty string, we know that the entry is “deleted” by the user.
The reason why we are doing “lazy deletion” instead of actual deletion is because we need to perform synchronization of entries that were deleted online, but not purged on devices where the app is used but not yet synchronized.
3. Selecting all entries belonging to a user
SQL: SELECT * FROM entries WHERE user=$user
This query returns all information about all entries belonging to a user.


####Milestone 7: @@SD
Find out and explain what [QSA,L] means. Tell us about your most interesting rewrite rule.

QSA means “Query Statement Append”. Any GET parameters behind the URL will be transferred to the rewritten URL if the rewrite rule has this flag.
L means “Last”. If this rewrite rule with this flag is matched, the rewrite rule mechanism will stop at this rule and no longer check for other rules.
[QSA,L] means both the “QSA” and “L” flags are set for this rule.

@@@ RewriteRule ^api(?:/([^/]+))?/?$ api.php?id=$1 [QSA,L]
This rule rewrites all requests to “[APPURL]/api/” to “[APPURL]/api.php”. Since QSA is used, we can append parameters to the pre-rewritten URL and it’ll be passed to the API.


===========================================================================
###Phase 3

####Milestone 8: @@UX
Create an attractive icon and splash screen for your application. Try adding your application to the home screen to make sure that they are working properly.

####Milestone 9: @@UX
Style different UI components within the application using CSS in a structured way (i.e. marks will be deducted if you submit messy code). Explain why your UI design is the best possible UI for your application.

We have made our UI resemble the good old sticky note board, to give users a sense of familiarity on the first time that they use our app.

On top of that, we have also made our UI feel right as if you were managing real sticky notes. Drag and drop sticky notes to create (paste) them. Drag to the bin to delete (peel) them off. Sticky notes can be placed anywhere on the board as you desire, and you can move them around subsequently, so that you can group tasks together, just like in real life. The similarities in the user experience reduces learning curve required for users, and makes the app feel like “it just works” so that anyone can easily pick the app up.

There are also some little nuances in the UI that provides hints and makes it more intuitive.

The shaded triangular patch at the corner of the sticky note is a hint that the sticky note can be resized, and when you hover over it, further hinting is provided via a change in the cursor of your mouse.

We deliberately chose images of a pile of sticky notes for the icons where you drag and drop sticky notes from. This is a replication of real life where you tear and get your sticky notes from a pile.


####Milestone 10: @@LD
Implement and explain briefly the offline functionality of your application. Make sure that you are able to run and use the application from the home screen without any internet connection. State if you have used Web Storage, Web SQL Database or both in your application. Explain your choice.

App-Cache is implemented on the application. The application can be used offline as its assets such as images, JavaScript and HTML files are stored on the device in the application-cache. @@@ When an update is needed, the application will allow the user to reload the page to use a newer version of the application.

The application will store task entries in Web Storage so that it can be read offline.
We are using Web Storage because it is widely supported across many browsers compared to other alternatives like WebSQL.

####Milestone 11: @@LD
Explain how you will keep your client in sync with the server. Elaborate on the cases you have taken into consideration and how it will be handled.

####Milestone 12: @@LD
Compare the pros and cons of basic access authentication to other schemes such as using cookies, digest access authentication or even OAuth. Justify your choice of authentication scheme.

Cookies: 
Pros: Easy to implement and use. 
Cons: Cookies that can be accessed by JavaScript (i.e. not HTTP-only cookies) can be stolen by Cross-Site Scripting or Man-in-the-middle attacks for use in replay attacks. In the case of HTML5 mobile apps, if cookies are used for authentication, they are likely not going to be HTTP-only because the JavaScript side of the client may need access to information to authenticate the client (especially for REST requests).
**In the example provided in the assignment document, the cookie sends the password in clear, which poses a large security risk.
Digest Access Authentication (DAA):
Pros: More secure than cookies because the password is not sent in clear. Implementations using a nonce are protected from replay attacks.
Cons: Still vulnerable to man-in-the-middle attack because authenticity of the server is not verified.
OAuth:
Pros: More secure than cookies and DAA because server authenticity can be verified. User does not share credentials like passwords with the app.
Cons: Much harder to implement. User must leave the app to visit the login page on the actual site to authenticate (otherwise it’ll violate the “not share credentials” part). In OAuth 2.0 authentication cannot be done via AJAX because the user must visit the site in the intermediate step.

@@@ We are using cookies because it is the easiest to implement and given that there are no cross-user interactions, cross-site scripting attacks are less likely to affect the user.


####Milestone 13: @@UX
Describe 1-3 user interactions within the application and explain why those interactions help make it better.

For the Taak app, we have made our UI feel right as if you were managing real sticky notes.

1. Drag and drop a sticky note from the sticky note pile to create (paste) one. This is a replication of real life where you tear your sticky notes from a pile and paste them on a surface. Drag a sticky note to the bin to delete (peel in real life) it.

2. Sticky notes can be placed anywhere on the board as you desire, and you can move them around subsequently, so that you can group tasks together, just like in real life.

The similarities in the user experience reduces learning curve required for users, and makes the app feel like “it just works” so that anyone can easily pick the app up.

####Milestone 14: @@JS
Embed Google Analytics in your application and give us a screenshot of the report. Make sure you embed the tracker at least 48 hours before submission deadline as updates are reported once per day.

[Analytics is installed]

===========================================================================
####OPTIONAL

####Milestone 15: @@JS
Identify and integrate any social network(s) with users belonging to your target group. State the social plugins you have used. Explain your choice of social network(s) and plugins. (Optional)

####Milestone 16: @@JS
Make use of the Geolocation API in your application. Plot it with Bing or Google Maps or even draw out possible routes for the convenience of your user. (Optional)

####Milestone 17: @@JS
Justify your choice of framework/library by comparing it against others. Explain why the one you have chosen best fulfils your needs. (Optional)

===========================================================================
###MISC NOTES
During the user’s first visit to the site, we will tell the browser to quietly download and save the program for future use.
The Application Cache is how we will instruct it to retain all resources required for this “web page” to run in the absence of an internet connection. When used in conjunction with Web Storage or Web SQL Database, which allow storage of data on the local file system, your application can function like a native one.
After which, the client can operate with limited functionality when it is offline and communicate with the server using AJAX calls while it has internet access. Requests typically take the form of JSON or XML formatted messages and they contain details of a job to be processed by the server, such as querying the database for some information or to update its records.
The server then replies with a similarly formatted message response, which the client is responsible for decoding and notifying the user of.


===========================================================================
#Previous
###Phase 1

####Milestone 0: @@PB  
Describe the problem that your application solves.

@@@
We want to make it easy for people to maintain and keep ahead of their daily routines and to-do tasks.  
There are many people who have busy schedules with many to-do tasks to track, and wished that their their to-do task list could manage itself, without much manual intervention or rearrangement.

There are 3 main subsets to this problem.

1. You want to just know what you need to do when you open the app, instead of using some app where you have to click through numerous places just to see what you need to do.
2. You do not want to add tasks and then try to manually arrange them. You should have everything arranged nicely for you, immediately after adding the task to do.
3. Many a times, tasks also do not just take one day to complete, and needs to be kept on the calendar for many days.
Yet it is troublesome to have to keep shifting these tasks.

The way we intend to solve these problems through well-designed interfaces that makes it easy to manage to-do tasks.


####Milestone 1: @@PB
Describe your application and explain how you intend to exploit the characteristics of mobile cloud computing to achieve your application’s objectives, i.e. why does it make most sense to implement your application as a mobile cloud application?

@@@
It should be a mobile application because you need to be able to refer to your to-do task list on the go, any time anywhere.
It should use the cloud because many interactions happen online and you need to be able to sync those online interactions and to-do tasks into the app.
Another reason is that you should be able to access your data on any device, without having to manually transfer your data, since this syncing can be better done via the cloud.

####Milestone 2: @@PB
Describe your target users. Explain how you plan to promote your application to attract your target users.

@@@ Our target users are university students and young working adults who have busy schedules with many to-do tasks to track, and wished that their their to-do list could manage itself, without much manual intervention or rearrangement.
@@@ There are 3 main ways that we can promote the app.
@@@ First, we can allow users to share their schedules and allow other people to add tasks to their schedules. This increases exposure of the app to other people.
@@@ Second, some awesome features are unlockable only after you have invited X number of friends who use the app, which gives the user an incentive to invite more friends.
@@@ Third, further promotion can be done through Facebook/Twitter/Tumblr shares.


###Phase 3

####Milestone 9: @@UX
Style different UI components within the application using CSS in a structured way (i.e. marks will be deducted if you submit messy code). Explain why your UI design is the best possible UI for your application.

@@@
This is a mockup of the to do list. We try to keep everything as direct and simple as possible for the user, showing him only the main thing he wants to see (his tasks) at first glance. Rationale behind this is psychological - in normal memory retrieval cases, a strong trigger is all that is needed for users to recall everything about an event. In this case, just the title of the task would be sufficient for him to recall the details, such as deadline, location etc. The user can always tap to view more.

Moreover, seeing tasks is already enough for users to be more stressed, we do not want to cause additional stress by showing more information.

