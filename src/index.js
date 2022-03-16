import { render } from 'react-dom'
import { TextureLoader, Math as ThreeMath, UniformsUtils } from 'three'
import { useSpring, useTransition, animated, config } from 'react-spring/three'
import React, { useState, useMemo, useCallback, useRef } from 'react'
import { Canvas, useThree } from 'react-three-fiber'
import { HoverImageShader } from './resources/index'
import image2 from './resources/images/smiling.jpg'
import './styles.css'

const image = 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80'
const { degToRad } = ThreeMath
const loader = new TextureLoader()

function Texture({ texture, hoverValue, opacity, onHover, ...props }) {
  return (
    <animated.mesh {...props}>
      <planeBufferGeometry attach="geometry" args={[5, 7]} />
      <animated.shaderMaterial
        attach="material"
        transparent
        args={[{ ...HoverImageShader, uniforms: UniformsUtils.clone(HoverImageShader.uniforms) }]}
        uniforms-texture-value={texture}
      />
    </animated.mesh>
  )
}

function Image({ url, backUrl, rotation, ...props }) {
  // const [hovered, setHover] = useState(false)

  const { invalidate } = useThree()
  const textures = useMemo(() => {
    return [
      { id: 'front', texture: loader.load(url, invalidate), deg: 0 },
      { id: 'back', texture: loader.load(backUrl, invalidate), deg: 180 }
    ]
  }, [url, backUrl, invalidate])

  const transitions = useTransition(textures, (item) => item.id, {
    // config: config.default
  })

  return transitions.map(({ item: { texture, deg }, key }) => (
    <Texture
      key={key}
      {...props}
      texture={texture}
      rotation={rotation.interpolate((x, y, z) => [degToRad(x), degToRad(y + deg), degToRad(z)])}
      // opacity={opacity}
    />
  ))
}

function App() {
  const dragDelta = useRef(0)

  const [props, set] = useSpring(() => ({
    pos: [0, 0, 0],
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 }
  }))

  const [{ rotation }, setRotation] = useSpring(() => ({
    rotation: [0, 0, 0],
    config: { mass: 10, tension: 1000, friction: 300, precision: 0.00001 }
  }))

  const onClick = useCallback(
    (e) => {
      // filter clicks from dragging
      if (dragDelta.current < 100) {
        const [x, y, z] = rotation.getValue()

        setRotation({
          rotation: [x, y + 90, z],
          config: config.default
        })
      }
    },
    [rotation, setRotation]
  )

  return (
    <div className="main">
      <Canvas pixelRatio={window.devicePixelRatio || 1} style={{ background: '#272727' }} camera={{ fov: 75, position: [0, 0, 7] }}>
        <Image url={image} backUrl={image2} {...props} onClick={onClick} rotation={rotation} />
      </Canvas>
    </div>
  )
}

render(<App />, document.getElementById('root'))
