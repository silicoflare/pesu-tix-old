export function namify(name: string)    {
    let tokens = name.split(' ');
    tokens = tokens.map(token => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase());
    return tokens.join(' ');
}

export const studentFields: Record<string, string> = {
    prn: "PRN",
    srn: "SRN",
    name: "Name",
    phone: "Phone",
    email: "Email",
    program: "Program",
    branch: "Branch",
    semester: "Semester",
    section: "Section",
    campus: "Campus",
    cycle: "Cycle",
};

export function studentField(field: string): string {
    return studentFields[field] || "";
}

export function snakify(name: string)   {
    return name.replace(/ /g, '_').toLowerCase();
}