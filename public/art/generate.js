// Run the autoregressive drawing model off the UI thread.
importScripts('numjs.js','sketch_rnn.js');
self.onmessage = async ({data}) => {
  try {
    const {lines,animal} = data;
    if (!['cat','rabbit','bird'].includes(animal)) throw Error();
    const response = await fetch(animal+'.json');
    if (!response.ok) throw Error();
    const model = new SketchRNN(await response.json());
    model.set_pixel_factor(2);
    let state = model.update(model.zero_input(),model.zero_state());
    let [x,y] = lines[0][0];
    for (const line of lines) {
      for (let i=0;i<line.length;i++) {
        const [nx,ny] = line[i];
        const last = i===line.length-1;
        state = model.update([nx-x,ny-y,last?0:1,last?1:0,0],state);
        x=nx; y=ny;
      }
    }
    for (let trial=0;trial<4;trial++) {
      let current=state, px=x, py=y, down=false;
      const segments=[];
      for(let i=0;i<100;i++){
        const stroke=model.sample(model.get_pdf(current),0.45);
        if(stroke[4]) break;
        const nx=px+stroke[0], ny=py+stroke[1];
        if(down) segments.push([px,py,nx,ny]);
        down=Boolean(stroke[2]); px=nx; py=ny;
        current=model.update(stroke,current);
      }
      if(segments.length>=2){self.postMessage({segments});return;}
    }
    throw Error();
  } catch {self.postMessage({failed:true});}
};
