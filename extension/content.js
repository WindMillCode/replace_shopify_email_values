

function bulkConvertAllEmails({
  // remove any that will lead back to the shopify store
  removeAllSources,
  showContactEmail,
  storeURL,
  storeURLText
}) {
  console.log("ready to convert")
  editBtn = document.querySelector("#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div.Polaris-Page-Header__PrimaryActionWrapper > div > button")
  console.log(editBtn)
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request)
  if(request.msg.type === "StartJob"){
    bulkConvertAllEmails(request.msg.value)
  }
});
