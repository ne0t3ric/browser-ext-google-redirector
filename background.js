function shouldRedirect(urlstring){
	if (!isValidHttpUrl(urlstring)){
		return false;
	}
	
    var url = new URL(urlstring);
	
	return url.protocol === "https:" && isAGoogleUrl(url)
}

function isValidHttpUrl(string) {
  var url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function useGoogleFRUrl(urlstring){
	var url = new URL(urlstring);

	url.protocol = "http:";
	url.hostname = "www.google.fr";
		
	return url.toString();
}

function isAGoogleUrl(url){
	return [
		'www.google.com',
		'www.google.com',
		'www.google.fr',
		'www.google.fr',
	].includes(url.hostname)
}

function browserActionListener(tab){
	//get current URL
    var currentUrl = tab.url;

	//create a new url
	if (shouldRedirect(currentUrl)){
		var newUrl = useGoogleFRUrl(currentUrl);
		
		//Update the current url to the proxyed url
		browser.tabs.update(tab.id, {url: newUrl});
	}
}


function onCompletedRequestListener(details){
  var statusCode = details.statusCode;
  var currentUrl = details.url;
  var requestedResourceType = details.type;
  var originUrlString = details.originUrl ? details.originUrl : details.initiator ? details.initiator : '';
  var originUrl = isValidHttpUrl(originUrlString) ? new URL(originUrlString) : new URL('http://dummy');

  var isMainRequest = requestedResourceType === "main_frame";
  var isRequestComingFromLinkGoogle = requestedResourceType === "other" && isAGoogleUrl(originUrl);
	
	
   if ((isMainRequest || isRequestComingFromLinkGoogle) && statusCode === 403 && shouldRedirect(currentUrl)){
	  var tabId = details.tabId;
	  var newUrl = useGoogleFRUrl(currentUrl);

	  browser.tabs.update(tabId, {url: newUrl});
   }

  return;
}


// Force refresh by clicking on addon icon
if (!browser.browserAction.onClicked.hasListener(browserActionListener)){
	browser.browserAction.onClicked.addListener(browserActionListener);
};


// Catch 403 error for google requests (coming from proxy)
if (!browser.webRequest.onCompleted.hasListener(onCompletedRequestListener)){
	browser.webRequest.onCompleted.addListener(
	 onCompletedRequestListener,
	{
		urls: ["<all_urls>"],
		types: ["main_frame", "other"]
	},
	[]
	)
};




// !!!!! ENABLE WEBREQUESTBLOCKING PERMISSIONS IN ORDER TO USE THIS !!!
// Force redirect to google.fr when google.com is requested. Not necessary needed because it works sometimes on google.com
/*
function onBeforeRequestListener(details){
  var currentUrl = details.url;
  
  if (shouldRedirect(currentUrl){
	  var newUrl = useGoogleFRUrl(currentUrl);
	  return {
		  redirectUrl: newUrl
	  }
  }
}


if (!browser.webRequest.onBeforeRequest.hasListener(onBeforeRequestListener)){
	browser.webRequest.onBeforeRequest.addListener(
	  onBeforeRequestListener,
	  {urls: ["https://*.google.com/*"]},
	  ["blocking"]
	)
};*/


// Attemp to catch every google url (not working because catch also scripts, images, css, etc... urls)
/*browser.webRequest.onErrorOccurred.addListener(
  function(details){
	  const currentUrl = details.url;
	  var newUrl = useGoogleFRUrl(currentUrl);

	  if (shouldRedirect(details.url)){
		  var tabId = details.tabId;
		  
		  browser.tabs.update(tabId, {url: newUrl});
	  } else {
		  console.log(details.originUrl, details.url, details.documentUrl);
	  }
  },
  {urls: ["https://*.google.fr/*"], types: ["main_frame"]},            
)*/


// Attempt using HSTS
/*browser.webRequest.onHeadersReceived.addListener(
  function(details){
	  var responseHeaders = details.responseHeaders
	  
	  responseHeaders = responseHeaders.filter(function(header){
		  return header.name !== "Strict-Transport-Security" && header.name !== "Location")
	  });
	  
	  responseHeaders.push({
		name: "Strict-Transport-Security",
        value: "max-age=0"
	  })

	  return {responseHeaders: responseHeaders};
  },
  {urls: ["http://*.google.fr/*", "http://*.google.com/*","https://*.google.fr/*", "https://*.google.com/*"]},
  ["blocking", "responseHeaders"]
);*/