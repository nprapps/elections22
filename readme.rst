elections22
======================================================

This news app is built on our `interactive template <https://github.com/nprapps/interactive-template>`_. Check the readme for that template for more details about the structure and mechanics of the app, as well as how to start your own project.

Getting started
---------------

To run this project you will need:

* Node installed (preferably with NVM or another version manager)
* The Grunt CLI (install globally with ``npm i -g grunt-cli``)
* Git

With those installed, you can then set the project up using your terminal:

#. Pull the code - ``git clone git@github.com:nprapps/elections22``
#. Enter the project folder - ``cd elections22``
#. Install dependencies from NPM - ``npm install``
#. Start the server - ``grunt``

Running tasks
-------------

Like all interactive-template projects, this application uses the Grunt task runner to handle various build steps and deployment processes. To see all tasks available, run ``grunt --help``. ``grunt`` by itself will run the "default" task, which processes data and starts the development server. However, you can also specify a list of steps as arguments to Grunt, and it will run those in sequence. For example, you can just update the JavaScript and CSS assets in the build folder by using ``grunt bundle less``.

Common tasks that you may want to run include:

* ``sheets`` - updates local data from Google Sheets
* ``docs`` - updates local data from Google Docs
* ``google-auth`` - authenticates your account against Google for private files
* ``static`` - rebuilds files but doesn't start the dev server
* ``cron`` - runs builds and deploys on a timer (see ``tasks/cron.js`` for details)
* ``publish`` - uploads files to the staging S3 bucket

  * ``publish:live`` uploads to production
  * ``publish:simulated`` does a dry run of uploaded files and their compressed sizes

**Notable flags and combinations of tasks:**

* ``grunt local --test`` — run an AP test on your local machine on a 60-second cron
* ``grunt --offline`` — run the project with the AP data you have locally
* ``grunt clean sheets docs static publish:live`` — republishes assets + code to the live server but doesn’t touch the data (helpful when results are live)

Tracked events
--------------

* ``route`` - sends the URL fragment as the event label
* ``county-metric`` - the county table's custom metric was updated
* ``county-sort`` - the user clicked a header to re-sort a county table
* ``clicked-bubble`` - the user clicked a bubble on the margin plot
* ``clicked-cartogram`` - the user clicked a state on the cartogram
* ``clicked-map`` - the user clicked a state on the national map
* ``tab-selected`` - the user manually chose a tab to view

Additional links and params
--------------

* Homepage embed: ``/homepage.html``

  * ``display=margins,cartogram,map`` controls which viz displays on load

* Balance of Power embed (House and Senate bars): ``/embedBOP.html``

  * ``president=true`` adds electoral totals to the top (for use on homepage)
  * ``hideCongress=true`` hides House and Senate bars on mobile view
  * ``onlyPresident=true`` hides House and Senate bars on all views
  * ``inline=true`` for side-by-side display (for use on liveblog)
  * ``theme=dark`` for dark theme

* Internal ballot initiative board: ``/#/ballots``
* Results embed customizer: ``/customizer.html``
* Share pages, with metadata for social cards

  * ``/share/XX.html`` - state pages, where XX is the postal code
  * ``/share/president.html`` - Presidential big board
  * ``/share/senate.html`` - Senate big board
  * ``/share/house.html`` - House big board
  * ``/share/governor.html`` - Governors big board
  
Social share pages
------------------

The way the results rig is built, links shared over social always show an image / headline that have to do with the overall project, not the particular view of the page you were looking at. (It’s a similar case with the `annotations rig <https://github.com/nprapps/anno-docs>`_ and the `News Apps liveblog <https://github.com/nprapps/liveblog-standalone>`_.)

To address this, there are “share links” generated for all the top-level pages (house/senate/gov boards, each state) that have appropriate headlines/teasers/images and redirect.

* Example: https://apps.npr.org/elections20-interactive/share/CO.html
* Which redirects to: https://apps.npr.org/elections20-interactive/#/states/CO

The templates for them live in the `src folder <https://github.com/nprapps/elections22/tree/main/src>`_ as ``_office_social.html`` and ``_state_social.html``. The text lives in the longform text doc. The pages are rendered as part of the `build task <https://github.com/nprapps/elections22/blob/main/tasks/build.js#L66-L80>`_.

Setting overrides
-----------------

**Candidate-specific medatadata** — ``candidates`` tab

You can use this to override metadata like party affiliation or name.

For a given row, fill in the `key` for the candidate's AP identifier. (Make sure this cell is cast as a NUMBER.) And then fill in the column (or create one if it doesn't exist) that corresponds to the data attribute from AP that you want to override. For example, Candidate X is reported with party affiliation "Una" (for "unaffiliated") and you want to override that to "Ind" ("independent").  Add a comment in the spreadsheet so others know what this is for.

.. list-table::
   :widths: 50 50
   :header-rows: 1

   * - key
     - party
   * - 12345
     - Ind


**Race rosters** — ``rosters`` tab

You can use this to specify which candidates appear by default in results tables. Relevant use cases:

* Specify who appears in the results table when there's no data yet
* Ensure, once data starts coming in, that a candidate always appears in the data regardless of the vote. (Note: Once data starts coming in, any candidate who receives above a set threshold of the vote will appear in the table. But those below the threshold will be grouped into "other" unless explicitly added to a roster.)

For a given row, fill in the `key` for AP race ID. (Make sure this cell is cast as a NUMBER.) And then fill in the candidate IDs for the candidates you want to make sure display, comma-delimited. Add a comment in the spreadsheet so others know what this is for.

.. list-table::
   :widths: 50 50
   :header-rows: 1

   * - key
     - value
   * - 12345
     - 456, 2345, 2359


Ranked Choice Voting
---------------

During the 2022 elections, races in Maine and Alaska went to RCV runoff elections. Little documentation on how AP's API is currently available, so this is an attempt to characterize how returns worked this year and what could be done to address this in the future. AP did answer some questions about how these results would look--but the answers were often aspirational rather than accurate. 

### Config-based approach used in 2022

What's missing in the AP's API is a formal linkage between the general election result and the RCV result. The raceIDs for the general election and RCV runoff should be entered in the rcv tab of the config spreadsheet. 

With the race ID's present, the rig will prefer the RCV runoff result, but use the general election result if the RCV race hasn't been called. 

This behavior is set to match AP's actions in 2022, which news orgs weren't given much heads up about. They may provide more details or tweak how this works in subsequent years. 



Troubleshooting
---------------

**Fatal error: Port 35729 is already in use by another process.**

The live reload port is shared between this and other applications. If you're running another interactive-template project or Dailygraphics Next, they may collide. If that's the case, use ``--reload-port=XXXXX`` to set a different port for the live reload server. You can also specify a port for the webserver with ``--port=XXXX``, although the app will automatically find the first available port after 8000 for you.
