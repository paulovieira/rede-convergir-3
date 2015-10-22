var popupTemplate = _.template("<b class='popup-event'>Nome do evento: </b> <%= title %><br>    <b class='popup-event'>Descrição: </b><%= description %><br>  <b class='popup-event'>Dia: </b> <%= start.format('LL') %><br>  <b class='popup-event'>Hora: </b> <%= start.format('LT') %><br>  <b class='popup-event'>Mais informações: </b> <%= moreInfo %><br>");

var customEvents = [
    {
        title: 'All Day Event',
        description: 'All Day Event - descrição completa',
        start: '2015-10-11',
        coordinates: [39.5, -8.2],
        moreInfo: "<a href='#'>Clique aqui para abrir a página do evento</a>"
    }, {
        title: 'Long Event',
        description:'Long Event - descricao completa',
        start: '2015-10-04',
        end: '2015-10-06',
        coordinates: [39.7, -8.0],
        moreInfo: "<a href='#'>Clique aqui para abrir a página do evento</a>"
    }, {
        id: 999,
        title: 'Repeating Event (this one has a long long title)',
        description: 'Repeating Event - descrição completa',
        start: '2015-10-07T16:00:00',
        coordinates: [39.9, -7.8],
        moreInfo: "<a href='#'>Clique aqui para abrir a página do evento</a>"
    }, {
        id: 999,
        title: 'Repeating Event',
        description: 'Repeating Event - descrição completa',
        start: '2015-10-14T16:00:00',
        coordinates: [39.3, -7.6],
        moreInfo: "<a href='#'>Clique aqui para abrir a página do evento</a>"
    }, {
        title: 'Meeting a bb ccc dddd eeeee',
        description: 'Meeting - descrição completa',
        start: '2015-10-30T10:30:00',
        end: '2015-10-30T12:30:00',
        coordinates: [39.1, -7.4],
        moreInfo: "<a href='#'>Clique aqui para abrir a página do evento</a>"
    } 
];


var calendarOptions = {

    header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek'
    },
    lang: "pt",

    // select part of the calendar to add a new event
    selectable: true,
    selectHelper: true,
    select: function(start, end) {
        var title = prompt('Título do evento:');
        var eventData;
        if ($.trim(title)) {
            eventData = {
                title: title,
                start: start,
                end: end
            };
            $('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
        }
        $('#calendar').fullCalendar('unselect');
    },

    googleCalendarApiKey: 'AIzaSyAgMFcPxXG-kW-VAMm2ju9IPeCJkrjqBBI',

    eventClick: function(event) {

        //alert("TODO: edit this event");
        if(event.coordinates){
            window.e = event;
            console.log(event)
            layerGroup.clearLayers();

            var marker = L.marker(event.coordinates)
                .bindPopup(popupTemplate(event))
                

            layerGroup.addLayer(marker);
            marker.openPopup();
        }
        else{
            alert("Este evento não tem coordenadas");
            if(event.source && event.source.googleCalendarId){
                // opens events in a popup window
                window.open(event.url, 'gcalevent', 'width=700,height=600');                    
                //return false;
            }
        }

        return false;
    },

    // eventMouseover: function(event, jsEvent, view){
    //     debugger;
    //     console.log("mouseover")
    //     console.log(event)
    // },

    // eventMouseout: function(event, jsEvent, view){
    //     console.log("mouseout")
    //     console.log(event)
    // },

    googleCalendarError: function(err){
        throw new Error(err);
    },
    
    // loading: function(bool) {
    //     //debugger;
    //     $('#loading').toggle(bool);
    // },

    editable: true,
    eventLimit: true, // allow "more" link when too many events

    // add events
    eventSources: [
        {
            googleCalendarId: 'tredomqdvhti9rvdnm2goqd0fg@group.calendar.google.com',
            className: 'gcal-event'
        },
        customEvents
    ],

    // triggered with a true argument when the calendar begins fetching events via AJAX. Triggered with false when done
    loading: function(isLoading, view){

        $('#loading').toggle(isLoading);
        if(isLoading === false){
            var mapHeight = $("#calendar-container").height() + 60 + 30 - 5 - 4;
            $("#map").height(mapHeight + "px");            

            // $("a.fc-day-grid-event").attr("data-toggle", "popover");
            // $("a.fc-day-grid-event").attr("placement", "top");
            // $("a.fc-day-grid-event").attr("title", "title");
            // $("a.fc-day-grid-event").attr("content", "content");
            // $("a.fc-day-grid-event").attr("html", "true");
            // $("a.fc-day-grid-event").attr("original-title", "original title");

            $("a.fc-day-grid-event").each(function(){

                var content = $.trim($(this).find("span.fc-title").text());

                //debugger;
                if(content){
                    content += " (clique para ver mais informações)"
                    //$(this).attr("data-content", content);
                    //debugger;
                    $(this).popover({
                        placement: "right",
                        //title: title,
                        //template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
                        //template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content">xyz</div></div>',
                        content: content,
                        trigger: "hover"
                    });                    
                }



            });
        }





    }

};


$('#calendar').fullCalendar(calendarOptions);


window.map = L.map('map').setView([38.5, -8], 7);

L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
}).addTo(map);

var layerGroup = L.layerGroup([]).addTo(map);

