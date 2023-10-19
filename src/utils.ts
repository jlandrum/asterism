import { statSync } from "node:fs";
import { walkSync} from "@nodelib/fs.walk";
import { readFileSync, readSync } from "fs-extra";

/**
 * Recursively looks for a file
 * @param fileName The file to look for
 * @param directory The directory to look in, defaults to current directory
 * @returns 
 */
export function findFile(fileName: string, directory: string = './', withContents?: string): string | null {
	const files = walkSync(directory);

	for (const file of files) {
		if (file.name.endsWith(fileName)) {
			const data = readFileSync(file.path);
			if (!withContents || data.includes(withContents)) {
				return file.path; // Return the path if file is found
			}
		}
	}

	return null; // Return null if file is not found
}

export function isFolder(path: string) {
	try {
		return statSync(path).isDirectory();
	} catch {} finally {
		return false;
	}
}