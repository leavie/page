<!-- repl* -->

### HTML

The HTML for this example is very short, with a primary element which is the box that we'll be targeting (with the creative ID `"box"`) and some contents within the box.

```html
<div id="box">
  <div class="vertical">
    Welcome to <strong>The Box!</strong>
  </div>
</div>
```

### CSS

The CSS isn't terribly important for the purposes of this example; it lays out the element and establishes that the [`background-color`](https://developer.mozilla.org/en-US/docs/Web/CSS/background-color) and [`border`](https://developer.mozilla.org/en-US/docs/Web/CSS/border) attributes can participate in [CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions), which we'll use to affect the changes to the element as it becomes more or less obscured.

```css
#box {
  background-color: rgba(40, 40, 190, 255);
  border: 4px solid rgb(20, 20, 120);
  transition: background-color 1s, border 1s;
  width: 350px;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.vertical {
  color: white;
  font: 32px "Arial";
}

.extra {
  width: 350px;
  height: 350px;
  margin-top: 10px;
  border: 4px solid rgb(20, 20, 120);
  text-align: center;
  padding: 20px;
}
```
<style>
  #box {
  background-color: rgba(40, 40, 190, 255);
  border: 4px solid rgb(20, 20, 120);
  transition: background-color 1s, border 1s;
  width: 350px;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.vertical {
  color: white;
  font: 32px "Arial";
}

.extra {
  width: 350px;
  height: 350px;
  margin-top: 10px;
  border: 4px solid rgb(20, 20, 120);
  text-align: center;
  padding: 20px;
}
</style>

<div id="box">
  <div class="vertical">
    Welcome to <strong>The Box!</strong>
  </div>
</div>

### JavaScript

Finally, let's take a look at the JavaScript code that uses the Intersection Observer API to make things happen.

#### Setting up

First, we need to prepare some variables and install the observer.

```js

const numSteps = 20.0;
let boxElement;
let prevRatio = 0.0;
let increasingColor = "rgba(40, 40, 190, ratio)";
let decreasingColor = "rgba(190, 40, 40, ratio)";

// Set things up
window.addEventListener("load", (event) => {
  boxElement = document.querySelector("#box");

  createObserver();
}, false);

```

The constants and variables we set up here are:

- `numSteps`

  A constant which indicates how many thresholds we want to have between a visibility ratio of 0.0 and 1.0.

- `prevRatio`

  This variable will be used to record what the visibility ratio was the last time a threshold was crossed; this will let us figure out whether the target element is becoming more or less visible.

- `increasingColor`

  A string defining a color we'll apply to the target element when the visibility ratio is increasing. The word "ratio" in this string will be replaced with the target's current visibility ratio, so that the element not only changes color but also becomes increasingly opaque as it becomes less obscured.

- `decreasingColor`

  Similarly, this is a string defining a color we'll apply when the visibility ratio is decreasing.

We call [`Window.addEventListener()`](https://devdocs.io/dom/eventtarget/addeventlistener) to start listening for the `load` event; once the page has finished loading, we get a reference to the element with the ID `"box"` using [`querySelector()`](https://devdocs.io/dom/document/queryselector), then call the `createObserver()` method we'll create in a moment to handle building and installing the intersection observer.

#### Creating the intersection observer

The `createObserver()` method is called once page load is complete to handle actually creating the new [`IntersectionObserver`](https://devdocs.io/dom/intersectionobserver) and starting the process of observing the target element.

```js
function createObserver() {
  let observer;

  let options = {
    root: null,
    rootMargin: "0px",
    threshold: buildThresholdList()
  };

  observer = new IntersectionObserver(handleIntersect, options);
  observer.observe(boxElement);
}
```

This begins by setting up an `options` object containing the settings for the observer. We want to watch for changes in visibility of the target element relative to the document's viewport, so `root` is `null`. We need no margin, so the margin offset, `rootMargin`, is specified as "0px". This causes the observer to watch for changes in the intersection between the target element's bounds and those of the viewport, without any added (or subtracted) space.

The list of visibility ratio thresholds, `threshold`, is constructed by the function `buildThresholdList()`. The threshold list is built programmatically in this example since there are a number of them and the number is intended to be adjustable.

Once `options` is ready, we create the new observer, calling the [`IntersectionObserver()`](https://devdocs.io/dom/intersectionobserver/intersectionobserver) constructor, specifying a function to be called when intersection crosses one of our thresholds, `handleIntersect()`, and our set of options. We then call [`observe()`](https://devdocs.io/dom/intersectionobserver/observe) on the returned observer, passing into it the desired target element.

We could opt to monitor multiple elements for visibility intersection changes with respect to the viewport by calling `observer.observe()` for each of those elements, if we wanted to do so.

#### Building the array of threshold ratios

The `buildThresholdList()` function, which builds the list of thresholds, looks like this:

```js
function buildThresholdList() {
  let thresholds = [];
  let numSteps = 20;

  for (let i=1.0; i<=numSteps; i++) {
    let ratio = i/numSteps;
    thresholds.push(ratio);
  }

  thresholds.push(0);
  return thresholds;
}
```

This builds the array of thresholds—each of which is a ratio between 0.0 and 1.0, by pushing the value `i/numSteps` onto the `thresholds` array for each integer `i` between 1 and `numSteps`. It also pushes 0 to include that value. The result, given the default value of `numSteps` (20), is the following list of thresholds:

| #    | Ratio | #    | Ratio |
| :--- | :---- | :--- | :---- |
| 1    | 0.05  | 11   | 0.55  |
| 2    | 0.1   | 12   | 0.6   |
| 3    | 0.15  | 13   | 0.65  |
| 4    | 0.2   | 14   | 0.7   |
| 5    | 0.25  | 15   | 0.75  |
| 6    | 0.3   | 16   | 0.8   |
| 7    | 0.35  | 17   | 0.85  |
| 8    | 0.4   | 18   | 0.9   |
| 9    | 0.45  | 19   | 0.95  |
| 10   | 0.5   | 20   | 1.0   |

We could, of course, hard-code the array of thresholds into our code, and often that's what you'll end up doing. But this example leaves room for adding configuration controls to adjust the granularity, for example.

#### Handling intersection changes

When the browser detects that the target element (in our case, the one with the ID `"box"`) has been unveiled or obscured such that its visibility ratio crosses one of the thresholds in our list, it calls our handler function, `handleIntersect()`:

```js
function handleIntersect(entries, observer) {
  entries.forEach((entry) => {
    if (entry.intersectionRatio > prevRatio) {
      entry.target.style.backgroundColor = increasingColor.replace("ratio", entry.intersectionRatio);
    } else {
      entry.target.style.backgroundColor = decreasingColor.replace("ratio", entry.intersectionRatio);
    }

    prevRatio = entry.intersectionRatio;
  });
}
```