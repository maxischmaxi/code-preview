import {
    uniqueNamesGenerator,
    adjectives,
    colors,
    animals,
} from "unique-names-generator";

export function generateNickname(): string {
    const randomName: string = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: " ",
        length: 2,
    })
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    return randomName;
}
