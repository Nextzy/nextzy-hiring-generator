import React, { Component } from 'react'
import { FontObserver } from 'react-with-async-fonts';
import background from './template/background.jpg'
import './App.css'
import { Card, Typography, Slider, Button, Input, Checkbox } from 'antd'
import { createCanvas, loadImage } from 'canvas'

const { Text } = Typography
const { TextArea } = Input

// Canvas constants
const COVER_WIDTH = 1200
const COVER_HEIGHT = 1200

// Text constants
const DEFAULT_TEXT_MARGIN_TOP_DOUBLE_LINE = 55
const DEFAULT_TEXT_MARGIN_TOP_SINGLE_LINE = 70
const DEFAULT_HIRING_TYPE_TEXT_LINE_SPACING = 70
const DEFAULT_LABEL_TEXT_MARGIN_BOTTOM = 330
const DEFAULT_JOB_TITLE_TEXT_MARGIN_BOTTOM = 222
const DEFAULT_TEXT_MARGIN_BOTTOM = 285
const DEFAULT_TEXT_MARGIN_LEFT = 105
const LABEL_FONT_SIZE = '65px'
const FONT_SIZE = '80px'
const HIRING_TYPE_FONT_SIZE = '40px'
const MAX_TEXT_COVER = 50

// Export constant
const DEFAULT_IMAGE_QUALITY = 100

// Image resize calculation
const FIT_BOTH = 0
const FIT_WIDTH = 1
const FIT_HEIGHT = 2

const options = [
  { label: 'Full-time', value: 'full_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' },
];

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      coverDataUrl: undefined,
      text1: 'Job title',
      text2: undefined,
      isImageSelected: false,
      imageQuality: DEFAULT_IMAGE_QUALITY
    }
  }

  componentDidMount() {
    this.refresh()
  }

  calculateImageSize = (imageWidth, imageHeight, canvasWidth, canvasHeight) => {
    let side = this.getMostSizeFit(imageWidth, imageHeight, canvasWidth, canvasHeight)
    let width = 100
    let height = 100
    if(side === FIT_HEIGHT) {
      width = canvasHeight * imageWidth / imageHeight
      height = canvasHeight
    } else if(side === FIT_WIDTH) {
      width = canvasWidth
      height = canvasWidth * imageHeight / imageWidth
    } else {
      width = canvasWidth
      height = canvasHeight
    }
    return { width, height}
  }

  getMostSizeFit = (imageWidth, imageHeight, canvasWidth, canvasHeight) => {
    let imageRatio = imageWidth / imageHeight
    let canvasRatio = canvasWidth / canvasHeight
    if (canvasRatio > imageRatio) {
      return FIT_WIDTH
    } else if(canvasRatio < imageRatio) { 
      return FIT_HEIGHT
    } else {
      return FIT_BOTH
    }
  }

  generateCover = async () => {
    const canvas = createCanvas(COVER_WIDTH, COVER_HEIGHT)
    const context = canvas.getContext('2d')
    const { text1, text2, imageQuality } = this.state

    // Draw background
    let backgroundImage = await loadImage(background)
    let { width: backgroundImageWidth, height: backgroundImageHeight } = this.calculateImageSize(backgroundImage.width, backgroundImage.height, canvas.width, canvas.height)
    let backgroundImagePositionX = (canvas.width - backgroundImageWidth) / 2
    let backgroundImagePositionY = (canvas.height - backgroundImageHeight) / 2
    context.drawImage(backgroundImage, backgroundImagePositionX, backgroundImagePositionY, backgroundImageWidth, backgroundImageHeight)

    // Calculate the position and margin of text
    let textLabelPositionX = DEFAULT_TEXT_MARGIN_LEFT
    let text1PositionX = DEFAULT_TEXT_MARGIN_LEFT
    let text2PositionX = text1PositionX
    let textLabelPositionY = (canvas.height - DEFAULT_LABEL_TEXT_MARGIN_BOTTOM)
    let text1PositionY = (canvas.height - DEFAULT_JOB_TITLE_TEXT_MARGIN_BOTTOM)
    let text2PositionY = text1PositionY + DEFAULT_HIRING_TYPE_TEXT_LINE_SPACING

    // Draw foreground 1st cover text
    const label = 'Hiring'
    context.font = LABEL_FONT_SIZE + ' "Montserrat"'
    context.fillStyle = 'white'
    context.fillText(label, textLabelPositionX, textLabelPositionY)

    // Draw job title text
    const jobTitle = text1 || ''
    context.font = '600 ' + FONT_SIZE + ' "Montserrat"'
    context.fillStyle = 'white'
    context.fillText(jobTitle, text1PositionX, text1PositionY)

    // Draw hiring type text
    const hiringType = text2 || ''
    context.font = HIRING_TYPE_FONT_SIZE + ' "Montserrat"'
    context.fillStyle = 'white'
    context.imageSmoothingEnabled = true
    context.fillText(hiringType, text2PositionX, text2PositionY)

    // Update to state
    this.setState({
      coverDataUrl: canvas.toDataURL('image/jpeg', imageQuality / 100)
    })
  }

  loadImage = source => {
    return new Promise((resolve, reject) => {
      let image = new Image()
      image.src = source
      image.onload = () => {
        resolve(image)
      }
    })
  }

  onJobTitleTextChanged = e => {
    let words = e.target.value
    e.target.value = words.slice(0, MAX_TEXT_COVER)
    this.setState({
      text1: words
    })
    this.refresh()
  }

  onHiringTypeCheckChanged = e => {
    let words = options.filter((item) => {
      return e.includes(item.value); 
    }).map((item) => {
      return item.label
    }).join(', ')
    this.setState({
      text2: words
    })
    this.refresh()
  }

  onImageQualityChanged = value => {
    this.setState({
      imageQuality: value
    })
    this.refresh()
  }

  refresh = () => {
    setTimeout(() => {
      this.generateCover()
    }, 300)
  }

  downloadCover = () => {
    let filename = (('_' + this.state.text1) || '').toLowerCase().replace(' ', '_').replace('/', '_').replace('-', '_')
    let a = document.createElement('a')
    a.href = this.state.coverDataUrl
    a.download = 'hiring' + filename + '.jpg'
    a.click()
  }

  backToMain = () => {
    this.setState({
      coverDataUrl: undefined,
      text1: undefined,
      text2: undefined,
      isImageSelected: false, 
      imageQuality: DEFAULT_IMAGE_QUALITY
    })
  }

  render() {
    const { coverDataUrl } = this.state
    return (
      <FontObserver montserrat="Montserrat">
      <div className="App">
        <Card className="cover-generator">
          <div>
            <img className="image-render" src={coverDataUrl} alt="" onClick={this.downloadCover} />
          </div>
          <div>
            <Text className="download-description">Click on the image to download</Text>
          </div>
          <div className="cover-text">
            <TextArea
              className="job-title"
              placeholder="Job title"
              autosize={{ minRows: 1, maxRows: 1 }}
              onChange={this.onJobTitleTextChanged}
            />
            <Checkbox.Group
              className="hiring-type"
              options={options}
              defaultValue={[]}
              onChange={this.onHiringTypeCheckChanged}
            />
          </div>
          <div className="image-quality">
            <Text className="image-quality-label">Image Quality</Text>
            <Slider
              className="image-quality-slider"
              defaultValue={DEFAULT_IMAGE_QUALITY}
              min={50}
              max={100}
              step={10}
              dots={true}
              onChange={this.onImageQualityChanged}
            />
          </div>
        </Card>
      </div>
      </FontObserver>
    )
  }
}

export default App
