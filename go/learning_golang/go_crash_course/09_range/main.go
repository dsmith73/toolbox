package main

import (
	"fmt"
)

func main() {
	ids := []int{
		33,
		76,
		54,
		23,
		11,
		2}

	// Loop through ids
	for _, id := range ids {
		fmt.Printf("ID : %d\n", id)
	}

	// ADD ids together
	sum := 0
	for _, id := range ids {
		sum += id
	}
	fmt.Println("Sum", sum)

	// Range with map
	emails := map[string]string{
		"dan": "dsmith73@gmail.com",
		"bob": "bob@gmail.com",
		"joy": "joy@gmail.com"}

	for k, v := range emails {
		fmt.Printf("%s : %s\n", k, v)
	}

	for k := range emails {
		fmt.Printf("Name : %s\n", k)
	}
}
