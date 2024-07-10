

async function sendMsgToWebsite(msg) {

  chrome.windows.getCurrent(w => {
    chrome.tabs.query({active: true, windowId: w.id}, async(tabs) => {
      const tabId = tabs[0].id;
      const response = await chrome.tabs.sendMessage(tabId, {msg});

    });
  });

}

function getValues() {
  const mediaOptions = [
    "removeSources",
    "showContactEmail"
  ];
  value = {};
  mediaOptions.forEach(option => {
    let checkbox = document.getElementById(option);
    value[option] = checkbox.checked;
  });
  const inputs = [
    "storeURL",
    "storeURLText",
    "forgotPassURL",
    "accountURL"
  ];
  inputs.forEach(option => {
    let myInput = document.getElementById(option);

    if (myInput) {
      value[option] = myInput.value;
    }
  });

  return value
}

startJob = ()=>{

  sendMsgToWebsite({
    type:"StartJob",
    value:getValues()
  })
  window.close()
}

updateThisTemplate = ()=>{

  sendMsgToWebsite({
    type:"UpdateThisTemplate",
    value:getValues()
  })
  window.close()
}


window.addEventListener('DOMContentLoaded',async () => {
  document.querySelector("#startJob").addEventListener("click",startJob)
  document.querySelector("#updateThisTemplate").addEventListener("click",updateThisTemplate)
  let removeSources = document.getElementById("removeSources");
  removeSources.checked = true;
  document.getElementById("storeURL").value="https://example.com:4203/account/billing"
  document.getElementById("forgotPassURL").value = "https://example.com:4203/auth/forgot-pass"
  document.getElementById("accountURL").value="https://example.com:4203/account/overview"

})


