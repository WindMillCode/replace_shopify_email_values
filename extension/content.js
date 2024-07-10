let editBtnSelector = "#settings-body > div > div.Polaris-Box > div.Polaris-Page-Header--mediumTitle > div > div.Polaris-Page-Header__RightAlign > div.Polaris-Page-Header__PrimaryActionWrapper > div > button"


let htmlTemplateLinesSelector ="div.cm-content.cm-lineWrapping > div.cm-line"

let htmlTemplateScrollerSelector = "#settings-body > div > div:nth-child(2) > div > div > form > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div:nth-child(4) > div > div > div > div.cm-scroller"


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function bulkConvertAllEmails({
  // remove any that will lead back to the shopify store
  removeAllSources,
  showContactEmail,
  storeURL,
  storeURLText
}) {

  let emailTemplates = Array.from(document.querySelectorAll("._SettingsItem__clickableAction_ihwpi_123"))

  emailTemplates.forEach((x,i)=>{
    if(i ===0){
      x.click()
      setTimeout(() => {
        let editBtn = document.querySelector(editBtnSelector)
        editBtn.click()

        setTimeout(() => {

          let htmlTemplateScroller  = document.querySelector(htmlTemplateScrollerSelector)

          let items = [1,2,3,4];
          (async function() {
            for (const [k, z] of items.entries()) {
              let htmlTemplateLines = Array.from(document.querySelectorAll(htmlTemplateLinesSelector));
              htmlTemplateLines.forEach((y, j) => {
                if (removeAllSources) {
                  // Your logic for removing all sources
                }
                console.log(y.innerText);
              });

              htmlTemplateScroller.scrollTop = (htmlTemplateScroller.scrollHeight * z) / items.length;

              // Wait for 1 second before moving to the next iteration
              await sleep(2000);
            }
          })();



        }, 3000);


      }, 1000);
    }
  })



}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if(request.msg.type === "StartJob"){
    bulkConvertAllEmails(request.msg.value)
  }
});


document.querySelectorAll("._SettingsItem__clickableAction_ihwpi_123")
