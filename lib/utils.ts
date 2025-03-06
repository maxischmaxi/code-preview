import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { EditorType, Templates } from "./definitions";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function templateToString(template: keyof Templates) {
    switch (template) {
        case "react":
            return `React (${templates.react.language})`;
        case "javascript":
            return `JavaScript (${templates.javascript.language})`;
        case "css":
            return "CSS";
        case "dir_reduction":
            return `Directory Reduction (${templates.dir_reduction.language})`;
        case "image_crop":
            return `Image Crop (${templates.image_crop.language})`;
        default:
            return `${template} (${templates[template].language})`;
    }
}

export const templates: Templates = {
    react: {
        code: `import { useState, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  const [intervalId, setIntervalId] = useState();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount(count + 1);
    }, 1000);

    setIntervalId(intervalId);
  }, [intervalId]);

  return (
    <h2>Current count: {count}</h2>
    <button class="btn btn-danger" onClick={clearInterval(intervalId)}>
      Stop Counter
    </button>
  );
}
`,
        solution: `import { useState, useEffect, useRef } from "react";

// NOTE: The component should be exported
export function Counter() {
  const [count, setCount] = useState(0);
  // NOTE: The intervalId should not be set with state to prevent unnecessary rerenders
  const intervalRef = useRef(null);

  /* NOTE: The function should not be declared inline on the button. This ensures
           a) a better readability of the template and the defined functions in the component
           b) a possible performance optimization with "useCallback" or "useMemo"
  */
  const handleStopCounter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      // NOTE: The intervalId should be reset when the counter is stopped
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      // NOTE: Count should use the current value from callback instead of the components state value
      setCount((currentCount) => currentCount + 1);
    }, 1000);

    intervalRef.current = intervalId;

    // NOTE: A cleanup function should be used. Otherwise we would never clear our interval, resulting in memory leaks
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  // NOTE: The dependency array of the effect should be empty to prevent infinite rerender loops

  // NOTE: A React component can only ever return one node. We should use a fragment to return multiple elements.
  return (
    <>
      <h2>Current count: {count}</h2>
      <button
        {/* NOTE: "class" should be "className" */}
        className="btn btn-danger"
        {/* NOTE: The onClick should accept a function. 
                  Previously the interval was always cleared immediately and 
                  even threw an error on first render (because no intervalId was defined) */}
        onClick={handleStopCounter}
      >
        Stop Counter
      </button>
    </>
  );
}
`,
        language: "javascript",
    },
    javascript: {
        code: `var randomHeight = randomIntBetween(1, 1000);

function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function setAndLogRandomDimensions(selector) {
  let element = document.querySelector(selector);

  this.run = function () {
    randomWidth = randomIntBetween(1, 1000);

    element.style.height = randomHeight;
    element.style.width = randomWidth;
    element.classList.push("new-dimensions-applied");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        let displayHeightReadFromElement = element.getBoundingClientRect().height,
          displayWidthReadFromElement = element.getBoundingClientRect().width;

        console.log(displayHeightReadFromElement + "x" + displayWidthReadFromElement);
      });
    });
  };
}

// Every second, this function sets a new random width and height onto the given element
// and log the new dimensions to the console.
const foobar = setAndLogRandomDimensions("div.foobar-element");
setInterval(() => {
  foobar.run();
}, 1000);
`,
        solution: `// NOTE: This should be a const
// NOTE: This should be moved into the "run" function. Otherwise the height does not change on every call.
var randomHeight = randomIntBetween(1, 1000);

function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function setAndLogRandomDimensions(selector) {
  // NOTE: This can be a const
  let element = document.querySelector(selector);

  // NOTE: The "this" is not doing anything at the moment.
  //       We could do one of two things to make it work:
  //         - Add a "new" keyword in front of the call to "setAndLogRandomDimensionsThing"
  //         - return a record with a "run" key ({ run: function() ... })
  this.run = function () {
    // NOTE: This is missing a var, let or const, making it a global variable
    randomWidth = randomIntBetween(1, 1000);

    element.style.height = randomHeight; // NOTE: The unit is missing. The value should be \`\$\{randomHeight\}px\`
    element.style.width = randomWidth; // NOTE: The unit is missing. The value should be \`\$\{randomWidth\}px\`
    element.classList.push("new-dimensions-applied"); // NOTE: It should be classList.add()

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        // NOTE: getBoundingClientRect is an expensive operation.
        //       We could just execute it once and use the result afterwards.

        // NOTE: Chaining variables with a "," is potentially dangerous, as forgetting the comma
        //       leads to the variables below becoming global.
        let displayHeightReadFromElement = element.getBoundingClientRect().height,
          displayWidthReadFromElement = element.getBoundingClientRect().width;

        // NOTE: This could be written with a template string:
        //       \`\$\{displayHeightReadFromElement\}x\$\{displayWidthReadFromElement\}\`
        console.log(displayHeightReadFromElement + "x" + displayWidthReadFromElement);
      });
    });
  };
}

// Every second, this function sets a new random width and height onto the given element
// and log the new dimensions to the console.
const foobar = setAndLogRandomDimensions("div.foobar-element");
setInterval(() => {
  foobar.run();
}, 1000);
`,
        language: "javascript",
    },
    css: {
        code: `.very-semantically-named-thing {
  content: url(/images/test.jpg);
  &.emphasized {
    font-color: rgba(255 0 0 / 100%) !important;
  }
  padding: 20px 0px;

  text-align: middle;
  @media screen and (min-width = 768px) {
    padding: 10px;

    @media screen and (min-width: 320px) {
      padding: 5px;
    }
  }

  display: block;
  -webkit-border-radius: 5px;
  position: fixed;

  -webkit-transform: translateZ(0);
  transform: translateZ(0);

  &:before {
    position: absolute;
    width: 100px;
    height: 100px;
    background-color: green;
  }
}
`,
        solution: `/* NOTE: the order of the rules should follow a consistent scheme */
.very-semantically-named-thing {
  /* NOTE: the contents of the "url" function should be quoted */
  content: url(/images/test.jpg);
  &.emphasized {
    /* NOTE: important should never be used */
    /* NOTE: font-color does not exist. It should be "color" */
    font-color: rgba(255 0 0 / 100%) !important;
  }
  /* NOTE: 0 values do not need a unit */
  /* NOTE: would be better to use "padding-block: 20px" and "padding-inline: 0" to support right-to-left layouts */
  padding: 20px 0px;

  /* NOTE: this should be "center" */
  text-align: middle;
  /* NOTE: media query syntax is wrong. It should be a ":" instead of an "="  */
  @media screen and (min-width = 768px) {
    padding: 10px;

    /* NOTE: This media query is never doing anything  */
    @media screen and (min-width: 320px) {
      padding: 5px;
    }
  }

  display: block;
  /* NOTE: -webkit is not needed anymore */
  /* NOTE: the unprefixed border radius is missing */
  -webkit-border-radius: 5px;
  position: fixed;

  /* NOTE: -webkit is not needed anymore */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);

  /* NOTE: pseudo elements should start with a :: */
  &:before {
    /* NOTE: there is not "content" on this before, so it is not rendered */
    position: absolute;
    width: 100px;
    height: 100px;
    /* NOTE: colors should not use the named variant. Use rgba, hex, hsl, ... and ideally some variable  */
    background-color: green;
  }
}
`,
        language: "css",
    },
    dir_reduction: {
        code: `<?php

// How I crossed a mountainous desert the smart way.
// There are directions given, for example, the following:

// ["NORTH", "SOUTH", "SOUTH", "EAST", "WEST", "NORTH", "WEST"].

// You can immediatly see that going "NORTH" and immediately "SOUTH" is not reasonable,
// better stay to the same place! So the task is to give to the man a simplified version of the plan.
// A better plan in this case is simply: ["WEST"]
//
// Other examples:
// In ["NORTH", "SOUTH", "EAST", "WEST"], the direction "NORTH" + "SOUTH" is going north and
// coming back right away.

// The path becomes ["EAST", "WEST"], now "EAST" and "WEST" annihilate each other, therefore,
// the final result is [].

// In ["NORTH", "EAST", "WEST", "SOUTH", "WEST", "WEST"], "NORTH" and "SOUTH"
// are not directly opposite but they become directly opposite after the reduction of
// "EAST" and "WEST" so the whole path is reducible to ["WEST", "WEST"].

// Task
//
// Write a function dirReduc which will take an array of strings and returns an array of strings
// with the needless directions removed (W<->E or S<->N side by side).
//
// Examples:
// $test = [
// 		"test1" => ["NORTH", "SOUTH", "SOUTH", "EAST", "WEST", "NORTH", "WEST", "NORTH"],
// 		"test2" => ["NORTH","SOUTH","SOUTH","EAST","WEST","NORTH"],
// 		"test3" => ["NORTH","SOUTH","SOUTH","EAST","WEST","NORTH","NORTH"]
// ];
// $expect = [
// 		"test1" => ["WEST","NORTH"],
// 		"test2" => [],
// 		"test3" => ["NORTH"]
// ];

function dirReduc($directions)
{
	$result = [];
	// todo implement this function
	return $result;
}

dirReduc(["NORTH", "SOUTH", "SOUTH", "EAST", "WEST", "NORTH", "WEST", "NORTH"]);
`,
        language: "php",
        solution: `<?php

function dirReduc($directions)
{
	$result = [];

	// Create a map of opposite directions for an easier lookup
	$oppositeMap = [
		"NORTH" => "SOUTH",
		"SOUTH" => "NORTH",
		"EAST" => "WEST",
		"WEST" => "EAST"
	];

	// Go through each given direction
	foreach ($directions as $direction) {
		if ($oppositeMap[$direction] === end($result)) {
			// If the last element in the result array is an opposite of the current direction,
			// we remove the last element and don't push the current one.
			array_pop($result);
		} else {
			// If the current direction is any other than the opposite, push it to the end of the result
			$result[] = $direction;
		}
	}

	return $result;
}

dirReduc(["NORTH", "SOUTH", "SOUTH", "EAST", "WEST", "NORTH", "WEST", "NORTH"]);
`,
    },
    image_crop: {
        code: `<?php

/**
 * Problem Description:
 * 
 * A client would like to set a focus point on an image.
 * This focus point has to influence the scaling & cropping of the image,
 * so the point is always as close to the center of the resulting image as possible.
 * (As long as there is enough space to the sides of the image)
 * 
 * For example:
 * +------------------------+
 * |                        |
 * |                   x    |
 * |                        |
 * |                        |
 * +------------------------+
 * Having a focus point set at the position marked by the "x", if the image
 * gets cropped to a portrait resolution, it should closely look like this:
 * +---------+
 * |         |
 * |    x    |
 * |         |
 * |         |
 * +---------+
 * If the focus point is not set, the image should be cropped from the center.
 * 
 * 
 * Task:
 * Create a function, which calculates the position (top left corner) of where
 * the cropping should start.
 */

function calculate_crop_start_position(
	int $original_image_width,
	int $original_image_height,
	int $desired_width,
	int $desired_height,
	?int $focus_point_x = null,
	?int $focus_point_y = null,
) {
	$start_x = 0;
	$start_y = 0;

	// Your code here...

	return [$start_x, $start_y];
}
`,
        solution: null,
        language: "php",
    },
};

export function setMonacoEditorOptions(
    monaco: EditorType,
    lintingEnabled: boolean,
) {
    if (!lintingEnabled) {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
        });

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        });

        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        });

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: false,
        });

        monaco.languages.css.cssDefaults.setOptions({
            validate: false,
        });
    } else {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2020,
        });

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });

        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        });

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
        });

        monaco.languages.css.cssDefaults.setOptions({
            validate: true,
        });
    }
}
