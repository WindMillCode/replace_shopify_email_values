let editBtnSelector = "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div.Polaris-Page-Header__PrimaryActionWrapper > div > button"


let htmlTemplateLinesSelector ="div.cm-content.cm-lineWrapping > div.cm-line"

let htmlTemplateScrollerSelector = "#settings-body > div > div:nth-child(2) > div > div > form > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div > div > div > div.cm-scroller"

let previewBtnSelector = "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div > div > div.Polaris-ActionMenu-Actions__ActionsLayout > div:nth-child(2) > button"

let saveChangesSelector = "#center-slot > div > div > div > div > div > div._ButtonContainer_1nw3y_42 > span > button"

let generalNotificationsSelector = "#SettingsDialog > div._DialogChildren_9hr7h_4._DialogChildrenTopBar_9hr7h_9 > section > div > div._SettingsNavContainer_pyit9_45 > div > div > div > nav > ul > li:nth-child(15) > div > a"

let customerNotificationsSelector = "._SettingsItem_ihwpi_31._SettingsItem--clickable_ihwpi_61"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    await sleep(1);
    scroller.scrollTop += Math.ceil(scroller.clientHeight/2) * scrollCounter;
    scrollCounter+=1

    await sleep(100); // Adjust sleep time based on the rendering speed
  }
  scroller.scrollTop = 0
}

async function bulkConvertAllEmails(myInput) {

  let emailTemplates = Array.from(document.querySelectorAll("._SettingsItem__clickableAction_ihwpi_123"));

  // TODO figure out how to prevent the page from reloadomg
  (async () => {
    for (let i = 0; i < emailTemplates.length; i++) {
      if(i === myInput.myIndex){

        let x = emailTemplates[i];
        x.click();
        await sleep(2000);

        let editBtn = document.querySelector(editBtnSelector);
        editBtn.click();
        await sleep(3000);

        await convertEmailTemplate(myInput, false);

        try {
          let saveChanges = document.querySelector(saveChangesSelector);
          saveChanges.click();
        } catch (error) {
        }
        await sleep(3000);

        let generalNotifications = document.querySelector(generalNotificationsSelector);
        generalNotifications.click();
        await sleep(2000);

        let customerNotifications = document.querySelector(customerNotificationsSelector);
        customerNotifications.click();
        await sleep(1000);
      }
    }
  })();


}

async function convertEmailTemplate(myInput,showPreview=true) {

  let htmlTemplateScroller  = document.querySelector(htmlTemplateScrollerSelector)
  await scrollAndEditElements(htmlTemplateScroller,myInput)
  if(showPreview){
    let previewBtn = document.querySelector(previewBtnSelector)
    previewBtn.click()
  }

}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if(request.msg.type === "StartJob"){
    bulkConvertAllEmails(request.msg.value)
  }
  else if(request.msg.type === "UpdateThisTemplate"){
    convertEmailTemplate(request.msg.value)
  }
});


