async function setStorageItem(key, value) {
  try {
    return await localStorage.setItem(key,JSON.stringify(value))
  } catch (error) {
    return await localStorage.setItem(key,value)
  }
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
  try {
    let value = localStorage.getItem(key)
    return JSON.parse(value)
  } catch (error) {
    return await localStorage.getItem(key)
  }
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

  return new Promise((res,rej)=>{
    chrome.windows.getCurrent(w => {
      chrome.tabs.query({active: true, windowId: w.id}, async(tabs) => {
        const tabId = tabs[0].id;
        const response = await chrome.tabs.sendMessage(tabId, {msg});
        res(response)

      });
    });
  })


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
        value[option] = parseInt(value[option] ?? 0)
      }
    }
  });

  return value
}

startJob = async ()=>{
  let value = getValues()
  await setStorageItem("currentIndex",value.myIndex.toString())
  sendMsgToWebsite({
    type:"StartJob",
    value
  })
  window.close()
}

stopJob = async ()=>{
  sendMsgToWebsite({
    type:"StopJob"
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


resetToDefault = ()=>{


  sendMsgToWebsite({
    type:"ResetToDefault",
    value:getValues()
  })
  // window.close()
}

window.addEventListener('DOMContentLoaded',async () => {
  document.querySelector("#startJob").addEventListener("click",startJob)
  document.querySelector("#updateThisTemplate").addEventListener("click",updateThisTemplate)
  document.querySelector("#stopJob").addEventListener("click",stopJob)
  document.querySelector("#resetToDefault").addEventListener("click",resetToDefault)
  let removeSources = document.getElementById("removeSources");
  removeSources.checked = true;


  document.getElementById("storeURL").value="https://eneobia.com/account/billing"
  document.getElementById("forgotPassURL").value = "https://eneobia.com/auth/forgot-pass"
  document.getElementById("accountURL").value="https://eneobia.com/account/overview"

  let jobInfo = await sendMsgToWebsite({
    type:"GetInfo"
  })
  debugger
  document.getElementById("myIndex").value = parseInt(jobInfo.jobInfo.myIndex ??0);



})


