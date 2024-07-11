let editBtnSelector = [
  "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div.Polaris-Page-Header__PrimaryActionWrapper > div > button",
  "#settings-body > div > div.Polaris-Box > div:nth-child(2) > div > div.Polaris-Page-Header__RightAlign > div.Polaris-Page-Header__PrimaryActionWrapper > div > button",
  "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div.Polaris-Page-Header__PrimaryActionWrapper > div > button"
]


let htmlTemplateLinesSelector ="div.cm-content.cm-lineWrapping > div.cm-line"

let htmlTemplateScrollerSelector = "#settings-body > div > div:nth-child(2) > div > div > form > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div > div > div > div.cm-scroller"

let previewBtnSelector = "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div > div > div.Polaris-ActionMenu-Actions__ActionsLayout > div:nth-child(2) > button"

let saveChangesSelector = "#center-slot > div > div > div > div > div > div._ButtonContainer_1nw3y_42 > span > button"

let generalNotificationsSelector = [
  "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__BreadcrumbWrapper > div > a","#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--longTitle > div > div.Polaris-Page-Header__BreadcrumbWrapper > div > a"
]

let customerNotificationsSelector = [
  "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__BreadcrumbWrapper > div > a",
  "#settings-body > div > div.Polaris-Box > div:nth-child(2) > div > div.Polaris-Page-Header__BreadcrumbWrapper > div > a"
]

let revertToDefaultBtnSelector = [
  "#settings-body > div > div:nth-child(2) > div > div > form > div > div:nth-child(2) > div > div > div:nth-child(2) > button"
]

let confirmRevertBtnSelector = [
  "#PolarisPortalsContainer > div:nth-child(14) > div:nth-child(1) > div > div > div > div.Polaris-Modal-Dialog__Modal > div.Polaris-Modal-Footer > div > div > div > div.Polaris-InlineStack > button.Polaris-Button.Polaris-Button--pressable.Polaris-Button--variantPrimary.Polaris-Button--sizeMedium.Polaris-Button--textAlignCenter.Polaris-Button--toneCritical"
]

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


function sleep(ms,waitTime=0) {
  return new Promise(resolve => setTimeout(resolve, ms+waitTime));
}

function containsSubstrings(text, substrings) {
  return substrings.some(substring => text.includes(substring));
}

async function scrollAndEditElements(scroller,myInput) {

  let {
    // remove any that will lead back to the shopify store
    removeSources,
    showContactEmail,
    storeURL,
    storeURLText,
    forgotPassURL,
    accountURL
  } = myInput

  let scrollCounter = 0
  while (scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight-3) {
    let elements = Array.from(document.querySelectorAll(htmlTemplateLinesSelector));
    elements.forEach((el) =>{

      if(removeSources){
        // check line 167

        el.innerHTML = el.innerHTML.replace("View your order","")
        el.innerHTML = el.innerHTML.replace("View payment information","")
        el.innerHTML = el.innerHTML.replace("Confirm order","")
        el.innerHTML = el.innerHTML.replace("Visit online store",storeURLText)
        el.innerHTML = el.innerHTML.replace("Items in your cart","")
        el.innerHTML = el.innerHTML.replace(/{{\s*order_status_url\s*}}/g, "");
        el.innerHTML = el.innerHTML.replace("Return to cart","")
        el.innerHTML = el.innerHTML.replace("Continue to checkiyt","")
        if (/Come back or visit/.test(el.innerText)) {
          console.log(el.innerHTML)
          el.innerHTML = el.innerHTML.replace("or", "");
          el.innerHTML = el.innerHTML.replace("Come back or visit","")
          el.innerHTML = el.innerHTML.replace("our online store","")
        }
        el.innerHTML = el.innerHTML.replace(/{{\s*customer.reset_password_url\s*}}/,forgotPassURL)
        el.innerHTML = el.innerHTML.replace(/{{\s*account_link\s*}}/,accountURL)
        el.innerHTML = el.innerHTML.replace(/{{\s*email_confirmation_url\s*}}/g, "");

      }
      if(storeURL){

        el.innerHTML = el.innerHTML.replace(/{{\s*shop\.url\s*}}/g, storeURL);
        // TODO gift card url
        el.innerHTML = el.innerHTML.replace(/{{\s*gift_card\.url\s*}}/g, storeURL);

        el.innerHTML = el.innerHTML.replace(/{{\s*checkout_payment_collection_url\s*}}/g, storeURL);
        el.innerHTML = el.innerHTML.replace(/{{\s*unsubscribe_url\s*}}/g, storeURL);
        el.innerHTML = el.innerHTML.replace(/{{\s*invoice_url\s*}}/g, storeURL);
        el.innerHTML = el.innerHTML.replace(/{{\s*checkout_url\s*}}/g, storeURL);
        // keep this one
        // el.innerHTML = el.innerHTML.replace(/{{\s*order_status_url\s*}}/g, storeURL);


      }
      if(storeURLText){
        el.innerHTML = el.innerHTML.replace("Visit our store", storeURLText);
        if (/<td class="link__cell">or <a/.test(el.innerText)) {
          el.innerHTML = el.innerHTML.replace("or", "");
        }
      }

      if(!showContactEmail){
        el.innerHTML = el.innerHTML.replace(/{{\s*shop\.email\s*}}/g, "");
        el.innerHTML = el.innerHTML.replace("or contact us at", "");
        el.innerHTML = el.innerHTML.replace("Let us know", "Reply to this email");
      }
    });

    scroller.scrollTop = 0
    await sleep(1,0);
    scroller.scrollTop += Math.ceil(scroller.clientHeight/2) * scrollCounter;
    scrollCounter+=1

    await sleep(100,0); // Adjust sleep time based on the rendering speed
  }
  scroller.scrollTop = 0
}

async function convertEmailTemplate(myInput,showPreview=true) {

  let htmlTemplateScroller  = document.querySelector(htmlTemplateScrollerSelector)
  await scrollAndEditElements(htmlTemplateScroller,myInput)
  if(showPreview){
    let previewBtn = document.querySelector(previewBtnSelector)
    previewBtn.click()
  }

}

async function resetEmailTemplate(){
  revertToDefaultBtnSelector.forEach((y,j)=>{

    let revertToDefaultBtn = document.querySelector(y);
    if(revertToDefaultBtn !==null){
      revertToDefaultBtn.click();
    }
  })
  await sleep(3000);

  confirmRevertBtnSelector.forEach((y,j)=>{

    let confirmRevertBtn = document.querySelector(y);
    if(confirmRevertBtn !==null){
      confirmRevertBtn.click();
    }
  })
  await sleep(2000);
}

async function runJob(myInput,type) {
  let emailTemplates = Array.from(document.querySelectorAll("._SettingsItem__clickableAction_ihwpi_123"));
  // lucky guess there has to be at least 30 different emails shopify can send out
  if(myInput.myIndex > emailTemplates.length && emailTemplates.length>30){
    await setStorageItem("replaceShopifyEmailValuesJobIsRunning","FALSE")
  }

  try {
    let x = emailTemplates[myInput.myIndex];
    x.click();
  } catch (error) {
    customerNotificationsSelector.forEach((y,j)=>{

      let customerNotifications = document.querySelector(y);
      if(customerNotifications !==null){
        customerNotifications.click();
      }
    })
  }

  await sleep(4000);
  try {
    emailTemplates = Array.from(document.querySelectorAll("._SettingsItem__clickableAction_ihwpi_123"));
    let x = emailTemplates[myInput.myIndex];
    x.click();
    await sleep(4000);
  } catch (error) {

  }

  editBtnSelector.forEach((y,j)=>{

    let editBtn = document.querySelector(y);
    if(editBtn !==null){
      editBtn.click();
    }
  })
  await sleep(3000);
  debugger
  if(type ==="bulkConvertAllEmails"){
    await convertEmailTemplate(myInput, false);
  }
  else if(type==="resetToDefault"){
    await resetEmailTemplate()
  } else{
    await resetEmailTemplate()
    await convertEmailTemplate(myInput, false);
  }

  try {
    let saveChanges = document.querySelector(saveChangesSelector);
    saveChanges.click();
  } catch (error) {

  }
  await sleep(4000);

  generalNotificationsSelector.forEach((y,j)=>{

    let generalNotifications = document.querySelector(y);
    if(generalNotifications !==null){
      generalNotifications.click();
    }
  })
  await sleep(3000);

  customerNotificationsSelector.forEach((y,j)=>{

    let customerNotifications = document.querySelector(y);
    if(customerNotifications !==null){
      customerNotifications.click();
    }
  })

  myInput.myIndex+=1
  await setStorageItem("replaceShopifyEmailValues",myInput)
  await sleep(5000);
  window.location.reload()

}



chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

  if(request.msg.type === "StartJob"){
    await setStorageItem("replaceShopifyEmailValues",request.msg.value)
    await setStorageItem("replaceShopifyEmailValuesJobIsRunning","TRUE")
    runJob(request.msg.value,"bulkConvertAllEmails")
  }
  else if(request.msg.type === "UpdateThisTemplate"){
    convertEmailTemplate(request.msg.value)
  }
  else if(request.msg.type === "StopJob"){
    await setStorageItem("replaceShopifyEmailValuesJobIsRunning","FALSE")
    window.location.reload()
  }
  else if(request.msg.type === "GetInfo"){
    sendResponse({
      jobIsRunning:await getStorageItem("replaceShopifyEmailValuesJobIsRunning"),
      jobInfo:await getStorageItem("replaceShopifyEmailValues"),
    })
  }
  else if(request.msg.type === "ResetToDefault"){
    await setStorageItem("replaceShopifyEmailValuesJobIsRunning","TRUE")
    runJob(request.msg.value,"resetToDefault")
  }
  else if(request.msg.type === "UpdateJob"){
    await setStorageItem("replaceShopifyEmailValuesJobIsRunning","TRUE")
    runJob(request.msg.value,"updateJob")
  }

});

getStorageItem("replaceShopifyEmailValuesJobIsRunning")
.then((jobIsRunning)=>{
  console.log(jobIsRunning)
  if(jobIsRunning ==="TRUE" ){
    getStorageItem("replaceShopifyEmailValues")
    .then(async (value)=>{
      await sleep(5000)
      runJob(value)
    })

  }

})
.catch(console.error)

