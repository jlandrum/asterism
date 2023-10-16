import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Recursively looks for a file
 * @param fileName The file to look for
 * @param directory The directory to look in, defaults to current directory
 * @returns 
 */
export function findFile(fileName: string, directory: string = './'): string | null {
	const files = readdirSync(directory);

	for (const file of files) {
		const filePath = join(directory, file);

		if (isFolder(filePath)) {
			const foundFile = findFile(filePath, fileName);
			if (foundFile) {
				return foundFile;
			}
		} else if (file === fileName) {
			return filePath;
		}
	}
	return null;
}

export function isFolder(path: string) {
	try {
		return statSync(path).isDirectory();
	} catch {} finally {
		return false;
	}
}