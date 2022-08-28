export default function rmSpaces(s: string): string {
	return s.replace(/^\s+|\s+$/g, '');
}
