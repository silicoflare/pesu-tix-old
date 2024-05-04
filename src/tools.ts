export function namify(name: string)    {
    let tokens = name.split(' ');
    tokens = tokens.map(token => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase());
    return tokens.join(' ');
}

