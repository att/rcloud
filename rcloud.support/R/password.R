#function to request a password popup

password <- function(prompt)
{
  caps <- rcloud.install.js.module(
            "password", "({
  prompt: function(v, k) {
    var x = prompt(v);
    k(x);
  }
})");
  caps$prompt(prompt)
}
