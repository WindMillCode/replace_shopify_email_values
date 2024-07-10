async function setStorageItem(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, function() {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

async function getStorageItem(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], function(result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] !== undefined ? result[key] : null);
      }
    });
  });
}


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
    "accountURL",
    "myIndex"
  ];
  inputs.forEach(option => {
    let myInput = document.getElementById(option);

    if (myInput) {
      value[option] = myInput.value;
      if(["myIndex"].includes(option)){
        value[option] = parseInt(value[option])
      }
    }
  });

  return value
}

startJob = async ()=>{
  await setStorageItem("jobIsRunning","TRUE")
  let value = getValues()
  await setStorageItem("currentIndex",value.myIndex.toString())
  sendMsgToWebsite({
    type:"StartJob",
    value
  })
  // window.close()
}

stopJob = async ()=>{
  await setStorageItem("jobIsRunning","FALSE")

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
  document.querySelector("#stopJob").addEventListener("click",stopJob)
  let removeSources = document.getElementById("removeSources");
  removeSources.checked = true;
  document.getElementById("myIndex").value = 0;
  document.getElementById("storeURL").value="https://example.com:4203/account/billing"
  document.getElementById("forgotPassURL").value = "https://example.com:4203/auth/forgot-pass"
  document.getElementById("accountURL").value="https://example.com:4203/account/overview"
  let jobIsRunning = await getStorageItem("jobIsRunning")
  if(jobIsRunning ==="TRUE" ){
    let currentIndex = await getStorageItem("currentIndex")
    document.getElementById("myIndex").value = parseInt(currentIndex)+1
    startJob()
  }

})


