# Offline mode

This document documents the offline capability of the application.

## Developer note

When modifying files, it might be wise to rename the "cache.manifest" file to something else, otherwise debugging or doing even basic development would be more tedious. A typical browser refresh will not actually get the latest copy if you are using app-cache.

Rename the manifest back to "cache.manifest" to re-enable offline mode.

## Updating the files if app-cache is enabled

1. Make changes to the "cache.manifest" file. E.g. edit the version number.
2. Refresh the page twice. (First one is to update the manifest to let browser know content has changed, second one is to update the content.)

If it still does not reload, ensure that the browser is actually using the updated manifest, by simply visiting the manifest from the browser.
