library(shiny)
library(XML)
library(methods)
library(DT)

ui <- fluidPage(
  tabsetPanel(
    tabPanel("Populair",
      sidebarLayout(
        sidebarPanel(tags$h1("Meest bezochte events"), br(), br(),
          sliderInput(inputId = "num",
            label = "Kies het aantal events dat getoond moet worden",
            value = 5, min = 1, max = 10), br(), br(),
          actionButton("reloadButton", "Haal data opnieuw op")
        ),
        mainPanel(
          plotOutput("eventbarplot"),
          height = 20
        )
      )
    ),
    tabPanel("Activiteit",
      sidebarLayout(
        sidebarPanel(tags$h1("Events tot laatste transactie"), br(), br(),
          actionButton("reloadButton2", "Haal data opnieuw op")
        ),
        mainPanel(
          height = 8,
          plotOutput("eventgraph")
        )
      )
    )
  )
)

xmldataframe <- xmlToDataFrame("dashboard.xml")
newdataframe <- as.data.frame(table(xmldataframe$event))
newdataframe2 <- newdataframe[order(- newdataframe$Freq),]

newdataframepop <- as.numeric(as.character(xmldataframe[["timestamp"]]))
numbins <- cut(newdataframepop, 20)

server <- function(input, output, session) {
    observeEvent(eventExpr = input$reloadButton, {
        showNotification("Herladen van XML file, dit kan even duren")
        xmldataframe <- xmlToDataFrame("dashboard.xml")
        newdataframe <- as.data.frame(table(xmldataframe$event))
        newdataframe2 <- newdataframe[order(- newdataframe$Freq),]
        showNotification("XML file geupdated!")
        output$eventbarplot <- renderPlot({
            barplot(newdataframe2$Freq, names.arg = newdataframe2$Var1, xlim = c(0, input$num), ylim = c(0, max(newdataframe2$Freq, na.rm = TRUE)), las = 2, col = "red")
        })
    })
    observeEvent(eventExpr = input$reloadButton2, {
        showNotification("Herladen van XML file, dit kan even duren")
        xmldataframe <- xmlToDataFrame("dashboard.xml")
        newdataframepop <- as.numeric(as.character(xmldataframe[["timestamp"]]))
        numbins <- cut(newdataframepop, 20)
        showNotification("XML file geupdated!")
        output$eventgraph <- renderPlot({
            plot(numbins, xaxt = 'n', xlab = paste("Transacties van ", as.POSIXct(as.numeric(as.character(min(newdataframepop / 1000))),origin="1970-01-01",tz="CET"), " tot ", as.POSIXct(as.numeric(as.character(max(newdataframepop / 1000))),origin="1970-01-01",tz="CET")), col = "blue")
        })
    })
    output$eventbarplot <- renderPlot({
        barplot(newdataframe2$Freq, names.arg = newdataframe2$Var1, xlim = c(0, input$num), ylim = c(0, max(newdataframe2$Freq, na.rm = TRUE)), las = 2, col = "red")
    })
    output$eventgraph <- renderPlot({
        plot(numbins, xaxt = 'n', xlab = paste("Transacties van ", as.POSIXct(as.numeric(as.character(min(newdataframepop / 1000))),origin="1970-01-01",tz="CET"), " tot ", as.POSIXct(as.numeric(as.character(max(newdataframepop / 1000))),origin="1970-01-01",tz="CET")), col = "blue")
    })
}

shinyApp(ui = ui, server = server)