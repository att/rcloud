#function to request a password popup
get.password <- function(){
  password <- self.oobSend(list("password","Please enter your password?"))
}
