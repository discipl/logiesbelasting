library(shiny)
library(XML)
library(methods)
library(DT)

ui <- fluidPage(
  sidebarLayout(
    sidebarPanel(tags$h1("Most popular events"), br(), br(),
      sliderInput(inputId = "num",
        label = "Choose the number of events you want to show",
        value = 5, min = 1, max = 20), br(), br(),
      actionButton("reloadButton", "Reload XML file")
    ),
    mainPanel(
      height = 8,
      plotOutput("eventbarplot")
    )
  )
)

xmldataframe <- xmlToDataFrame("ratinglijst.xml")
newdataframe <- as.data.frame(table(xmldataframe$event))
newdataframe2 <- newdataframe[order(-newdataframe$Freq),]

server <- function(input, output, session) {
  observeEvent(eventExpr = input$reloadButton, {
    showNotification("Reloading XML file, this might take a while")
    xmldataframe <- xmlToDataFrame("ratinglijst.xml")
    newdataframe <- as.data.frame(table(xmldataframe$event))
    newdataframe2 <- newdataframe[order(-newdataframe$Freq),]
    showNotification("Updated XML file!")
    output$eventbarplot <- renderPlot({
      barplot(newdataframe2$Freq, names.arg = newdataframe2$Var1, xlim = c(0,input$num), ylim = c(0,max(newdataframe2$Freq, na.rm = TRUE)), las = 2, col = "darkgrey")
    })
  })
  output$eventbarplot <- renderPlot({
    barplot(newdataframe2$Freq, names.arg = newdataframe2$Var1, xlim = c(0,input$num), ylim = c(0,max(newdataframe2$Freq, na.rm = TRUE)), las = 2, col = "darkgrey")
  })
}

shinyApp(ui = ui, server = server)