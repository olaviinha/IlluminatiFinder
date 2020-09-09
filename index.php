
<?php

if((isset($_POST['i']) && $_POST['i'] != '') || (isset($_POST['id']) && $_POST['id'] != '')){

    $img = $_POST['i'];     // Image URL
    $id = $_POST['id'];     // Image data
    $top = $_POST['top'];   // Crop start from top
    $left = $_POST['left']; // Crop start from left
    $size = $_POST['size']; // Width & height from Crop top-left point
    $frameSize = 600;       // Frame size (Final image is 2x2 frames)

    if($id != ''){
        $img = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $id));
        $type = 'data';
    } else {
        $type = 'url';
    }

    function processFrame($type, $image, $startX, $startY, $width, $height, $frameSize, $drawTriangle) {
        if($type=='url'){
            $imagick = new \Imagick($image);
        } else {
            $imagick = new \Imagick();
            $imagick->readImageBlob($image);
        }
        $imagick->cropImage($width, $height, $startX, $startY);
        $imagick->resizeImage($frameSize, $frameSize, imagick::FILTER_LANCZOS, true, true);
        if($drawTriangle == true){
            $draw = new \ImagickDraw(); 
            $draw->setFillColor('red');
            $draw->setStrokeColor('red');
            $draw->setStrokeWidth(2);
            $sy = rand(0, $frameSize/2);
            $sx = rand(0, $frameSize/2);
            $ey = rand($frameSize/4, $frameSize/1.2);
            $ex = rand($frameSize/4, $frameSize/1.2);
            $draw->line($sy, $sx, $ey, $ex);
            $ney = rand(0, $frameSize);
            $nex = rand(0, $frameSize);
            $draw->line($ey, $ex, $ney, $nex);
            $draw->line($ney, $nex, $sy, $sx);
            $imagick->drawImage($draw);
        }
        return $imagick->getImageBlob();
    }

    function combine($firstFrame, $secondFrame, $rows) {
        $im = new \Imagick();
        $im->readImageBlob($firstFrame);
        $im->readImageBlob($secondFrame);
        $im->resetIterator();
        $combined = $im->appendImages($rows);
        $combined->setImageFormat("jpeg");
        return $combined;
    }

    $firstFrame = processFrame($type, $img, $left, $top, $size, $size, $frameSize, false);
    $secondFrame = processFrame($type, $img, $left+($size/4), $top+($size/4), $size/2, $size/2, $frameSize, false);
    $thirdFrame = processFrame($type, $img, $left+($size/2), $top+($size/2), $size/4, $size/4, $frameSize, true);
    $illuDough = processFrame('url', 'illudough.jpg', 0, 0, 800, 800, $frameSize, false);

    $firstRow = combine($firstFrame, $secondFrame, false);
    $secondRow = combine($thirdFrame, $illuDough, false);
    $finale = combine($firstRow, $secondRow, true);

    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
    header('Content-Type: image/jpeg');
    echo base64_encode($finale);

} else {

?>

<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="description" content="Illuminati Finder">
    <meta name="author" content="O. Inha">
    <title>Illuminati Finder</title>
    <link href="//fonts.googleapis.com/css2?family=Gayathri:wght@100;400&display=swap" rel="stylesheet" />
    <script src="//ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="cropper.min.js"></script>
    <link  href="cropper.min.css" rel="stylesheet" />
    <script src="jquery.cropper.min.js"></script>
</head>
<body>
    <div class="cropper">
        <div class="start">
            <img src="pilluminati.png" class="logo" />
            <input type="text" id="imgUrl" placeholder="Paste image URL or image here." />
        </div>
    </div>
    <div class="actions"><button id="submit">Find Illuminati</button></div>
    <link rel="stylesheet/less" type="text/css" href="pilluminati.less" />
    <script src="//cdnjs.cloudflare.com/ajax/libs/less.js/3.0.2/less.min.js"></script>
    <script src="pilluminati.js"></script>
</body>
</html>

<?php
}
?>
