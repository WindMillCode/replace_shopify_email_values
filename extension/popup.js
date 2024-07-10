

async function sendMsgToWebsite(msg) {

  chrome.windows.getCurrent(w => {
    chrome.tabs.query({active: true, windowId: w.id}, async(tabs) => {
      const tabId = tabs[0].id;
      const response = await chrome.tabs.sendMessage(tabId, {msg});

    });
  });

}

startJob = ()=>{
  const mediaOptions = [
    "removeSources",
    "showContactEmail"
  ];
  value = {}
  mediaOptions.forEach(option => {
    let checkbox = document.getElementById(option);
    value[option] = checkbox.checked;
  });
  const inputs = [
    "storeURL",
    "storeURLText"
  ];
  inputs.forEach(option => {
    let myInput = document.getElementById(option);

    if (myInput) {
      value[option] =myInput.value
    }
  });
  sendMsgToWebsite({
    type:"StartJob",
    value
  })
}

updateThisTemplate = ()=>{
  const mediaOptions = [
    "removeSources",
    "showContactEmail"
  ];
  value = {}
  mediaOptions.forEach(option => {
    let checkbox = document.getElementById(option);
    value[option] = checkbox.checked;
  });
  const inputs = [
    "storeURL",
    "storeURLText"
  ];
  inputs.forEach(option => {
    let myInput = document.getElementById(option);

    if (myInput) {
      value[option] =myInput.value
    }
  });
  sendMsgToWebsite({
    type:"UpdateThisTemplate",
    value
  })
}


window.addEventListener('DOMContentLoaded',async () => {
  document.querySelector("#startJob").addEventListener("click",startJob)
  document.querySelector("#updateThisTemplate").addEventListener("click",updateThisTemplate)
  let removeSources = document.getElementById("removeSources");
  removeSources.checked = true;

})
