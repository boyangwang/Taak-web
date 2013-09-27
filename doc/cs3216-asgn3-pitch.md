#Pitch

###Goodness of Sticky Notes On The Go
Sticky notes work very well as to-do task planners and reminders, but they aren't conveniently portable. You can't exactly carry your physical sticky notes board around with you.

=====
###[insertion for shift up here]

###All Tasks In A Glance (Auto-View Display)

Out of sight, out of mind. That's why sticky notes are so effective. They're always pasted somewhere in sight and are a constant reminder of the tasks you need to do.

However, mobile devices have small screens that can only display so much. Many of the sticky notes on the app would be out of sight, and they would lose a key value of acting as a constant reminder.

So we wanted to reproduce this highly valued user experience for the sticky note board on our mobile app. We allow the user to "lock the screen", which triggers the Auto-View Display where we automatically cycle through the sticky note boards.


###Portable Sticky Note Board with Lock-Screen, Viewable Any Time
To maximize the usefulness of the Auto-View Display on a mobile device, it has to be viewable on the go, just like how you would put your time table on one side of your clear hardcover plastic folder, for easy viewing any time on the go.

However, this display should also prevent accidental unintended mistouches when the user is moving around.

Although mobile devices have their native lock screens, the user will not be able to view the sticky notes board on them.

Hence, we made a lock-screen feature on our app, so that the Sticky Note Board can always be in view.

When you lock the screen, the app is locked down and all usual buttons are disabled.


###Animated & Prominent Unlock Mechanism
To unlock the screen, simply touch the screen to activate the unlock-prompt, and touch the unlock-prompt 3 times. We made the unlock-prompt especially prominent so that it is impossible for users to miss it:

* Upon touching the locked screen, the screen has a black tint, which hints to the user that something (the unlock mechanism) has been triggered.
* It has a animated glowing circle that indicates the spot you should touch.
* The touch areas happen at 3 different spots so that it greatly reduces the chances for accidental mistouches to unlock the screen.
* It prominently displays the score count, so that you can easily see the remaining number of touches required before the screen is unlocked.
* Once you have made the 3 correct touches, the glowing circle will have a flashing animation.
* In the event that it is a mistouch, the unlock-prompt disappears after 5 seconds and resets the number of touches required before unlock.

Due to the varying support for Canvas, this only works on Desktops and Apple mobile devices, and does not work well on Android mobile devices, hence this is removed and unavailable for Android devices.

=====


###No Sign-up Required (@@??)
@@ A slight expansion from the sharing of a single sticky note.

@@Have a public url

@@Of course, for users who want to have private sticky note boards that are not accessible via a public url, we have also implemented user accounts and a sign-up process.

=====
###[to be shifted up to the top]

###Familiar User Experience Ported ($$ shift up?)
Sticky note users love sticky notes because of the ways that they can interact with them. The peeling, the sticking and the marking.

Our app brings all that familiarity into tablet devices. From the nostalgic colors of the sticky notes, to the customary corkboard, and all the way down to the beautiful Helvetical and Verdana fonts.


###Likeness to real life
We made our app as close to real-life as possible. Here are some of the real-life abilities you can do:
 
* Grab multiple sticky notes at once! (@@)
* Markers - mark them with a special symbol to check the tasks as done
* A trophy wall of sticky notes showing the tasks completed (@@)


###Stable & Reliable Sync Mechanism
Our sync mechanism is reasonably stable and reliable even when you use multiple instances of the app on multiple different types of devices.

This is a key feature of our app in helping users to manage their tasks at hand.


###Syncs even if you forget to login
Even if you forget to login before creating data, our sync mechanism is smart enough to transfer and sync those data to your account once you log in.

This lowers the barriers of entry for users to get onboard the app, since they can try it out without any consequences, and then continue with their data when they first log in (create an account on our server database) to the app.

More importantly, it also allows users to try our app any time any where once the app has been loaded onto their browser, even if they subsequently lose their Internet connection for days or even months.


###No Sign-up Required (@@??)
@@ A slight expansion from the sharing of a single sticky note.

@@Have a public url

@@Of course, for users who want to have private sticky note boards that are not accessible via a public url, we have also implemented user accounts and a sign-up process.

=====

###Calendar of Progress (Archived Done)
@@@@@ No time to implement :(


###Sticky Notes Giving
@@@@@ No time to implement :(

Give friends or family sticky notes.

=====

###Comfortable View & Easy Scrolling
We wanted users to feel comfortable viewing a sticky notes board on a tablet device, so we designed and made it very easy to scroll around and navigate.

###Access on any device
@@Responsive. Landscape or Portrait.








