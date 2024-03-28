const mdContentContainer = document.getElementById('md-content-container');
function createCheckboxes(jsonData){
                //debugger
                
                const ulist = document.createElement('ul');
                let count = 1
                jsonData.forEach((item,index) => {
                   //debugger
                    
                    var collapseItem = `
            <div class="card">
                <div class="card-header" id="heading${index}">
                    <a class="card-button border-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
                        ${item.folder.split('\\')[1]}
                    </a>
                </div>
                <div id="collapse${index}" class="card-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#accordion">
                    <div class="card-body"><ul class="list-group">`
                    if(typeof item.contents[0] !='undefined'){
                    item.contents[0].contents.forEach((items=>{
                        //debugger
                        collapseItem+=`<li class="list-group-item"><input type="checkbox" onchange="addmdfiles(this)" name="checkbox" value="${item.folder}\\${items}">${items}</li>`
                    }))
                }
                    collapseItem+=`</ul></div>
                </div>
            </div>
        `;
                    count++
                    $('#checkboxList').append(collapseItem);
                    //document.getElementById("user").innerHTML = 'Welcome, '
                });

            }
            
            function fetchMarkdownContent(file) {
                //debugger
                 return fetch('/mdcontent?file=' + encodeURIComponent(file))
                     .then(response => response.json())
                    
             
             }

            async function addmdfiles(mdfile){
                debugger
                let counter = 1
                if($('.file-content').length!=0){
                    counter = $('.file-content').each(()=>{}).length +1
                }
               if(mdfile.checked ==true){
                const file = mdfile.value 
                const content = await fetchMarkdownContent(file)
                const individualContainer = document.createElement('div')
                individualContainer.classList.add('file-content');
                individualContainer.classList.add(file);
                individualContainer.id = 'file'+counter
                individualContainer.innerHTML = convertMarkdownToHtml(content)
                //debugger
                mdContentContainer.appendChild(individualContainer);
                individualContainer.firstChild.children[0].children[0].id='lstbd'+counter                  
                          drag('file'+counter)
               } else{
                for(i=0;i<$('.file-content').length;i++){
                    debugger
                   if(this.value ==$('.file-content')[i].classList[1]){
                    $('.file-content')[i].remove()
                   }
                }
               }
            }


             function convertMarkdownToHtml(markdown) {
                //debugger
                let html = '';
                
                const lines = markdown[0].split('\n');
                html +='<ul class="list-group">'
                lines.forEach((line) => {
                   // debugger
                    if (line.startsWith('#')) {
                        // Heading
                        const headingText = line.substring(1).trim(); // Remove #
                        html += `<li class="list-group-item active"><h4>${headingText} <span class="badge bg-secondary listbadge"></span></h4></li>`;
                    } else if (line.startsWith('*')) {
                        // Checkbox
                        const checkboxText = line.substring(1).trim(); // Remove *
                        html += `<li class="list-group-item"><input type="checkbox" onchange="seltion(this)" name="checkbox" value="${checkboxText}">${checkboxText}</li>`;
                    } else {
                        // Normal text
                        html += line + '';
                    }
                });
                html +='</ul>'
         
                return html;

            }
        
            function drag(e){
            $('#md-content-container').sortable({
                    axis: 'y',
                    containment: 'parent'
                });
            }
            
            $('#generate').click(function(){
                //debugger
                var jsonData = [];
                $('.file-content').each(function() {
                    let header = $(this).find("h4").text();
                    
                    let data = []
                    $(this).find("input[type='checkbox']:checked").each(function() {
                        data.push($(this).val());
                        
                    });
                    
                    
                if (data.length > 0) {
                    jsonData.push({
                        header: header,
                        items: data
                    });
                }
                });
                
                
            $.ajax({
                url: '/save',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(jsonData),
                success: function(response) {
                    console.log('Data saved:', response);
                    window.location.href = '/home.html';
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    
                }
            });
        });
         
        $('#save-file').click(function(){
            //debugger
        var jsonData = [];
        $('.file-content').each(function() {
            let header = $(this).find("h4").text();
            let file_name = this.classList[1]
            let data = []
            $(this).find("input[type='checkbox']:checked").each(function() {
                data.push($(this).val());
            });

            
        if (data.length > 0) {
            jsonData.push({
                file_name:file_name,
                header: header,
                items: data
            });
        }
        });
        
        
    $.ajax({
        url: '/draft',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(jsonData),
        success: function(response) {
            console.log('Data saved:', response);
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
});

$('#loadDraftButton').click(function() {
    $.ajax({
        url: '/load-draft',
        type: 'GET',
        success: function(response) {
            //debugger
            // Populate the UI with the loaded draft data
            for(i=0;i<response.length;i++){
                loadfiles(response[i].file_name,i,response)
            }
            
        },
        
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
});
function seltion(e){
    //debugger
    let counto = e.parentElement.parentElement.children[0].children[0].children[0].textContent
    if(counto == ''){
        counting = parseInt(0) 
    }else{
        counting = parseInt(counto) 
    }
    const idval = e.parentElement.parentElement.id.slice(-1)
    if(e.checked == true){
        counting= counting +1  
        $('#lstbd'+idval).html(counting)
    }
    else{
        counting = counting - 1 
        $('#lstbd'+idval).html(counting)
    }

   
}

 function populateUI(data) {
    $('.file-content').each(function(index) {
        var section = data[index];
        $(this).find('h4').text(section.header);
        $(this).find('input[type="checkbox"]').each(function(itemIndex) {
                $(this).prop('checked', data[index].items.includes($(this).val()));
        });
    });
}

async function loadfiles(file,counter,response){
    const mdContentContainer = document.getElementById('md-content-container');
    const content =await fetchMarkdownContent(file);
            const individualContainer = document.createElement('div')
            individualContainer.classList.add('file-content');
            individualContainer.classList.add(file);
            individualContainer.id = 'file'+counter
             individualContainer.innerHTML = convertMarkdownToHtml(content)
            mdContentContainer.appendChild(individualContainer);
            drag('file'+counter)
            populateUI(response);
}

 

 fetch('/jsondata')
 .then(response => response.json())
 .then(createCheckboxes)
 .catch(error => console.error('Error fetching JSON:', error));