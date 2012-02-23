start = command

whitespace = [ \t\n\r]+

command = '@' id:identifier whitespace ps:paramlist { return {id: id, ps: ps}; }
	/ '@' id:identifier { return {id: id, ps: []}; }

identifier = first:[A-Za-z_] rest:[A-Za-z0-9_]+ { return first + rest.join("");}

paramlist = car:parameter whitespace cdr:paramlist { var result = [car]; for (var i=0; i<cdr.length; ++i) result.push(cdr[i]); return result; } 
          / car:parameter { return [car]; }

parameter = '{{' param:[A-Za-z0-9_.+/*\-\"\'\[\]()!@#$%\^&*;:<>,\\|]+ '}}' { return param.join(""); }
