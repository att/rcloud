#function to request a password popup
get.password <- function(){
  password <- self.oobMessage(list("password","Please enter your password?"))
}
