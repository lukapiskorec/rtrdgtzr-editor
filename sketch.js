/*

::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::'##::::::::::::::::::::
::'## ##:::::::::'######::::::::'## ##::::
:: ###..::::::::::. ##..:::::::: ###..::::
:: ##.::::::::::::: ##:::::::::: ##.::::::
:: ##::::::::::::::. ##::::::::: ##:::::::
::...:::::::::::::::...:::::::::...:::::::
:::::::::::::::::::::'##::::::::::::::::::
::::::::::::::::::::: ##:::::::::'#####:::
::'######:::::::::'#####::::::::'##. ##:::
::.......::::::::'##. ##::::::::. #####:::
:::::::::::::::::. #####::::::::'#.. ##:::
::::::::::::::::::......::::::::. ####.:::
::::'##::::::::::::::::::::::::::.....::::
::'######::::::::'#####:::::::::'## ##::::
:::. ##..::::::::.. ##.::::::::: ###..::::
:::: ##::::::::::: ##.:::::::::: ##.::::::
::::. ##::::::::: ######:::::::: ##:::::::
:::::...:::::::::.......::::::::...:::::::
::::::::::::::::::::::::::::::::::::::::::

     r t r d g t z r - e d i t o r
    { p r o t o c e l l : l a b s }
               2 0 2 4

*/




////// PRELOAD //////


function preload() {

  // load MonoMEK font
  monomek = loadFont('assets/MEK-Mono.otf');

}


let blob_mask;


////// SETUP //////


function setup() {

  // write info to the console
  infoToConsole();

  pixelDensity(1.0); // need to fix this so the gif.js exports the correct size
  frameRate(frame_rate); // frame rate for the main animation
  angleMode(DEGREES);

  /*
  // create canvas so it fits into the browser window
  if (windowWidth / windowHeight < w_h_ratio) {
    canvas = createCanvas(windowWidth, windowWidth / w_h_ratio);
  } else {
    canvas = createCanvas(windowHeight * w_h_ratio, windowHeight);
  }
  */

  // create canvas with fixed dimensions
  canvas = createCanvas(canvas_width, canvas_height);
  
  select('canvas').id('rtrdgtzr'); // change id of the canvas, we can access it with canvas#rtrdgtzr.p5Canvas
  select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2); // move canvas to the middle of the browser window


  // sets global data for the effect stack
  stack_data_main = setEffectData(effects_main_name);

  blob_mask = createGraphics(canvas_width, canvas_height); // create an alpha mask for the blobs

  
  /*

  // DESERIALIZE AN INPUT IMAGE - if signal param is not empty, which means it was stored already before
  if ($fx.getParam("signal").length != 0) {

    // resize canvas
    resizeCanvas(output_dim[0] + output_border[0], output_dim[1] + output_border[1]);
    select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2); // move canvas to the middle of the browser window

    // turn off showing the start and drop screens
    start_screen = false;
    drop_screen = false;

    // store the signal param data into a new variable - this way we avoid the maxLength limit
    signal = $fx.getParam("signal");

    // write more info to console
    console.log("\n", "format ->", format, 
                "\n", "input dimensions ->", target_dim[0], "x", target_dim[1], 
                "\n", "output dimensions ->", output_dim[0] + output_border[0], "x", output_dim[1] + output_border[1], 
                "\n", "output scale ->", output_scale, 
                "\n", "quality ->", quality, 
                "\n", "quantization ->", quant_f, 
                "\n", "decompressed characters ->", squares_nr[0] * squares_nr[1] * quality,
                "\n", "compressed characters ->", signal.length, 
                "\n", "image compression ->", Math.round(100 * signal.length / target_pixel_nr), "%", 
                "\n", "effect primary ->", effects_main_name, 
                "\n", "effect secondary ->", effects_background_name, 
                "\n", "invert ->", invert_input, 
                "\n", "era ->", effect_era, 
                "\n", "seed ->", effect_seed, 
                "\n", "author ->", $fx.minter, 
                "\n", "type ->", signal_type, 
                "\n", "signal ->", "\n\n", signal);

    // deserialize signal data into an input image - this is the starting point for all effect stacks
    input_img = deserializeSignalToImage(signal);

    // inverts the colors of the input image
    if (invert_input) {input_img.filter(INVERT);}

    // sets global data for the effect stack
    stack_data_main = setEffectData(effects_main_name);
    stack_data_background = setEffectData(effects_background_name);
    stack_data_background["light_threshold"] = 50; // override for effects on background
    stack_data_background["layer_shift"] = 0; // override for effects on background

    // create 5 frame animation using one of the effect stacks
    animateEffectStack(input_img, stack_data_main, stack_data_background, false);

  }
  */


}




////// DRAW - MAIN ANIMATION LOOP //////


function draw() {


  // DROP SCREEN - will disappear when the image is dropped onto the canvas
  if (drop_screen) {

    showDropScreen();

    // DRAG AND DROP IMAGE
    canvas.drop(gotFile, dropped); // callback to recieve the loaded file, callback triggered when files are dropped
    canvas.dragOver(highlightDrop); // triggered when we drag a file over the canvas to drop it
    canvas.dragLeave(unhighlightDrop); // triggered when we finish dragging the file over the canvas to drop it
  }

  // EDITING SIGNAL - if signal is not empty and thumbnail is loaded, draw the image on the screen
  if ((signal.length != 0) && (thumbnail)) {

    // deserializes the signal and draws the image every 5th frame
    if (frame_counter % 5 == 0) {
      // border color during editing
      background(0, 0, 0);

      // blue shape under the loaded image to show transparent squares
      fill(0, 0, 255);
      rect((canvas_dim[0] * image_border[0])/2, (canvas_dim[1] * image_border[1])/2, canvas_dim[0], canvas_dim[1]);
      
      // deserialize signal and draw the image
      deserializeSignal(signal);
    }

    if (!hide_info) {
      // shows signal and control info as text on the canvas
      showSignalInfo();
      showControlInfo();
    } else {
      // no info is shown on screen
    }

  }


  // EDITING SIGNAL (TEXT AFTER IMAGE DROP) - execute only if the dropped_image is loaded, will disappear after a short time
  if ((thumbnail) && (thumbnail_ready) && (drop_zone == 0) && (frame_counter_after_drop < 50)) {

    // shows load info as text on the canvas
    showAfterImageLoad();

    // increment the frame counter - this will make the loading text disappear
    frame_counter_after_drop++
  }


  // SHOWING EFFECTS

  /*
  if (effects_applied) {

    if (animation_paused) {
      // animation is paused so we will draw a fixed random frame (this is determined in keyPressed())
      frame_to_draw = buffer_frames[random_frame_nr];
    } else {
      // decide which frame to draw - we will loop through all 5 frames repeatedly to imitate the gif animation
      frame_to_draw = buffer_frames[frame_counter % nr_of_frames];
    }
  
    // black background when showing the final image with effects
    background(0, 0, 0);

    // draw appropriate frame
    copy(frame_to_draw, 0, 0, frame_to_draw.width, frame_to_draw.height, 0, 0, frame_to_draw.width, frame_to_draw.height)

  }
  */


  // apply mono dither to the dropped image
  if (apply_effects) {

    //output_dim = [target_dim[0] * output_scale, target_dim[1] * output_scale];
    //console.log("output scale -> " + output_scale.toString());
    //if (border_type == "none") { output_border = [0, 0]; }  // no border
    //else if (border_type == "thin") { output_border = [10 * output_scale, 10 * output_scale]; } // thin border
    //else { output_border = [20 * output_scale, 20 * output_scale]; } // thick border
    //resizeCanvas(output_dim[0] + output_border[0], output_dim[1] + output_border[1]);
    //select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2); // move canvas to the middle of the browser window

    // deserialize signal data into an input image - this is the starting point for all effect stacks
    //input_img = deserializeSignalToImage(signal);

    // create 5 frame animation using one of the effect stacks
    //animateEffectStack(input_img, stack_data_main, false);

    //effects_applied = true; // toggle to applied

    // increment the dither travel factor every time we press ENTER or SPACEBAR
    //travel_f = travel_f + 10;






    //frame_to_draw = buffer_frames[0];

    // black background when showing the final image with effects
    //background(0, 0, 0);

    // draw appropriate frame
    //copy(frame_to_draw, 0, 0, frame_to_draw.width, frame_to_draw.height, 0, 0, frame_to_draw.width, frame_to_draw.height)



  }




  // animated blobs
  if (apply_effects) {

    blob_mask.clear(); // clear the buffer, make all pixels transparent
    
    for (let i = 0; i < nr_of_blobs; i++) {
      blob_data[i].zoff += blob_temp;
      blob_mask.noStroke();
      blob_mask.fill('rgba(0, 0, 0, 1)'); // sets alpha channel to full opacity

      blob_mask.push();
      blob_mask.translate(blob_data[i].ox + (canvas_width / 4), blob_data[i].oy);
      blob_mask.noSmooth();
      blob_mask.beginShape();
      for (let t = 0; t < 360; t++) {
        let xoff = map(cos(t), -1, 1, 0, blob_data[i].nm);
        let yoff = map(sin(t), -1, 1, 0, blob_data[i].nm);
        let r = map(noise(xoff, yoff, blob_data[i].zoff), 0, 1, 1, blob_data[i].max);
        let x = r * cos(t);
        let y = r * sin(t);
        blob_mask.vertex(x, y);
      }
      blob_mask.endShape(CLOSE);
      blob_mask.pop();
    }



    background(0);

    let img = buffer_frames[0].get(); // copy image pixels
    img.mask(blob_mask); // mask the image

    // draw appropriate frame
    copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height)


  }




  // increment the frame counter - this controls the animations
  frame_counter++



  /*

  // START SCREEN - will disappear when any key is pressed
  if (start_screen) {

    showStartScreen();
  }


  // ERA SCREEN - will disappear when era is selected by clicking
  if (era_screen) {

    era_zone = getEra(); // get the currently selected era (mouse hover)
    showEraScreen();
  }


  // DROP SCREEN - will disappear when the image is dropped onto the canvas
  if (drop_screen) {

    showDropScreen();

    // DRAG AND DROP IMAGE
    canvas.drop(gotFile, dropped); // callback to recieve the loaded file, callback triggered when files are dropped
    canvas.dragOver(highlightDrop); // triggered when we drag a file over the canvas to drop it
    canvas.dragLeave(unhighlightDrop); // triggered when we finish dragging the file over the canvas to drop it
  }


  // EDITING SIGNAL - if signal is not empty and thumbnail is loaded, draw the image on the screen
  if ((signal.length != 0) && (thumbnail)) {

    // deserializes the signal and draws the image every 5th frame
    if (frame_counter % 5 == 0) {
      // magenta background so the border is easier to see during editing
      background(255, 0, 255);

      // blue shape under the loaded image to show transparent squares
      fill(0, 0, 255);
      rect((canvas_dim[0] * image_border[0])/2, (canvas_dim[1] * image_border[1])/2, canvas_dim[0], canvas_dim[1]);
      
      // deserialize signal and draw the image
      deserializeSignal(signal);
    }

    if (!display_signal && !hide_info) {
      // shows signal and control info as text on the canvas
      showSignalInfo();
      showControlInfo();
    } else if (display_signal) {
      // show signal characters as text on the canvas
      showSignalOnScreen();
    } else {
      // no info is shown on screen
    }
  }


  // EDITING SIGNAL (TEXT AFTER IMAGE DROP) - execute only if the dropped_image is loaded, will disappear after a short time
  if ((thumbnail) && (thumbnail_ready) && (drop_zone == 0) && (frame_counter_after_drop < 50)) {

    // shows load info as text on the canvas
    showAfterImageLoad();

    // increment the frame counter - this will make the loading text disappear
    frame_counter_after_drop++
  }


  // EDITING EFFECTS (AFTER REFRESH) - execute if the signal is not empty but the thumbnail is not defined (we lost it after the refresh)
  if ((signal.length != 0) && (thumbnail == undefined)) {
    
    if (animation_paused) {
      // animation is paused so we will draw a fixed random frame (this is determined in keyPressed())
      frame_to_draw = buffer_frames[random_frame_nr];
    } else {
      // decide which frame to draw - we will loop through all 5 frames repeatedly to imitate the gif animation
      frame_to_draw = buffer_frames[frame_counter % nr_of_frames];
    }
  
    // black background when showing the final image with effects
    background(0, 0, 0);

    // draw appropriate frame
    copy(frame_to_draw, 0, 0, frame_to_draw.width, frame_to_draw.height, 0, 0, frame_to_draw.width, frame_to_draw.height)

    // trigger screen capture once for the first frame and never again
    if (trigger_preview) {fxpreview(); trigger_preview = false;}

    

  }

  */


  // increment the frame counter - this controls the animations
  //frame_counter++

}