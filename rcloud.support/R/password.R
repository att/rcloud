#function to request a password popup
password <- function(prompt="Please enter your password") self.oobMessage(list("password", as.character(prompt)[1]))
