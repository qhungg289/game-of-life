export function create2dArray(rows, cols) {
	const array = new Array(rows);
	for (let i = 0; i < cols; i++) {
		array[i] = new Array(cols);
	}

	return array;
}
