# Google redirector


## What it does

Redirect to google.fr when it's .com, or refresh if it google.fr, until certificate check by proxy works

## Use with Firefox


### [Recommanded] Import from Firefox .xpi file


### Import add-on in developping mode

- Download zip source code via github and unzip
- Add a `manifest.json` file by copying `manifest.firefox.json` to `manifest.json` to the root folder
- Go to firefox adress bar and type `about:debugging`
- From the left menu, navigate to "This Firefox" or "Ce Firefox"
- Click on "Load Temporary Add-on..." and pick the manifest.json previously created

