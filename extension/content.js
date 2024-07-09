

function bulkConvertAllEmails({
  // remove any that will lead back to the shopify store
  removeAllSources,
  showContactEmail,
  storeURL,
  storeURLText
}) {

}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if(request.msg.type === "StartJob"){
    bulkConvertAllEmails(request.msg.value)
  }
});
