#include <stdio.h>
#include <string.h>

// Predict the exact output of this program.
// Submit as CTF{<exact_output>} with same case and punctuation.
// Hint lives in the challenge description.

int main(void) {
    const char *a = "dir";
    const char *b = "_walk";
    const char *c = "_detective";

    char out[64];
    strcpy(out, a);
    strcat(out, b);
    strcat(out, c);

    // The program prints the combined string, followed by a newline.
    printf("%s\n", out);
    return 0;
}
