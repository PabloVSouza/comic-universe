import React, { useRef, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

type StarType =
  | 'small-dot'
  | 'medium-star'
  | 'large-star'
  | 'complex-shape'
  | 'star-1'
  | 'star-2'
  | 'star-3'
  | 'star-4'
  | 'star-5'

interface StarProps {
  id: string
  position: Position
  size: number
  type: StarType
  glowDelay: number
  glowDuration: number
  baseOpacity: number
}

interface StarTheme {
  pathData: string
  className: string
}

interface Meteor {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  opacity: number
  fade: number
  trail: Array<{ x: number; y: number; opacity: number }>
  delay: number
  activeTime: number
  update: () => void
  draw: (ctx: CanvasRenderingContext2D) => void
  reset: (canvas?: HTMLCanvasElement) => void
}

const starThemes: Record<StarType, StarTheme> = {
  'complex-shape': {
    pathData:
      'M0,0c6.2,1.2,9.5,5.1,10.9,11.7.8-7,4.4-10.2,10.4-11.6-6.1-1.4-9.7-4.9-10.5-11.8-1.2,6.7-4.4,10.7-10.7,11.8Z',
    className: 'star-complex-shape'
  },
  'large-star': {
    pathData:
      'M0,0c3.7,4.7,7.5,7.2,13.3,5.5-3.9,4.1-6.5,8.3-4.3,14.8-4.1-3.6-7.6-7.3-13.5-4.8,4.4-4.4,6.2-9,4.5-15.5h0Z',
    className: 'star-large-star'
  },
  'medium-star': {
    pathData:
      'M0,0c2,3.1,4.2,5.2,4,6.7-.4,1.9-2.7,3.4-4.2,5-1.3-1.6-3.5-3.2-3.7-4.9-.1-1.7,1.9-3.6,3.9-6.8h0Z',
    className: 'star-medium-star'
  },
  'small-dot': {
    pathData:
      'M0,0c-2.8,2.4-4.4,4.8-5.8,4.7-1.6-.2-3-2.7-4.4-4.2,1.3-1.6,2.5-4.3,4.1-4.6,1.4-.3,3.2,2,6.1,4.1h0Z',
    className: 'star-small-dot'
  },
  'star-1': {
    pathData:
      'M0,0c6.2,1.2,9.5,5.1,10.9,11.7.8-7,4.4-10.2,10.4-11.6-6.1-1.4-9.7-4.9-10.5-11.8-1.2,6.7-4.4,10.7-10.7,11.8Z',
    className: 'star-individual-1'
  },
  'star-2': {
    pathData:
      'M0,0c-3.8-5-3.3-9.8-.8-15.3-4.6,4.2-9.1,3.7-13.9.6,3.6,5.1,3.9,10,.7,15.7,4.7-4.6,9.1-4.1,14-1.1Z',
    className: 'star-individual-2'
  },
  'star-3': {
    pathData: 'M0,0h9.5v-10.6h-10c.2,3.3.4,7.3.6,10.6Z',
    className: 'star-individual-3'
  },
  'star-4': {
    pathData: 'M0,0c.2,3.4.4,7.6.6,10.7,3-.2,6.4-.5,9.1-.6v-10h-9.7Z',
    className: 'star-individual-4'
  },
  'star-5': {
    pathData:
      'M0,0c-1.8,2-4.1,4.6-5.9,6.6,1.9,2.1,4.2,4.6,5.9,6.5,2.1-2.1,4.4-4.6,6.2-6.4-1.9-2-4.2-4.5-6.2-6.7Z',
    className: 'star-individual-5'
  }
}

const Star: React.FC<StarProps> = ({
  position,
  size,
  type,
  glowDelay,
  glowDuration,
  baseOpacity
}) => {
  const theme = starThemes[type]
  return (
    <g transform={`translate(${position.x * 10}, ${position.y * 10}) scale(${size * 0.8})`}>
      <path
        className={`cls-1 ${theme.className}`}
        d={theme.pathData}
        style={
          {
            opacity: baseOpacity,
            animation: `starGlow ${glowDuration}s ${glowDelay}s infinite`,
            '--base-opacity': baseOpacity
          } as React.CSSProperties
        }
      />
    </g>
  )
}

class MeteorClass {
  x: number = 0
  y: number = 0
  length: number = 0
  speed: number = 0
  angle: number = 0
  opacity: number = 0
  fade: number = 0
  trail: Array<{ x: number; y: number; opacity: number }> = []
  delay: number = 0
  activeTime: number = 0
  size: number = 0
  brightness: number = 0

  constructor(canvas?: HTMLCanvasElement) {
    this.reset(canvas)
  }

  reset(canvas?: HTMLCanvasElement) {
    if (!canvas) return

    const border = Math.floor(Math.random() * 2)

    switch (border) {
      case 0:
        this.x = -50 - Math.random() * 100
        this.y = Math.random() * canvas.height
        this.angle = Math.PI / 4 + (Math.random() * Math.PI) / 4
        break
      case 1:
        this.x = Math.random() * canvas.width
        this.y = -50 - Math.random() * 100
        this.angle = Math.PI / 4 + (Math.random() * Math.PI) / 4
        break
    }

    this.length = Math.random() * 120 + 60
    this.speed = Math.random() * 8 + 4
    this.opacity = Math.random() * 0.8 + 0.2
    this.fade = Math.random() * 0.004 + 0.001
    this.trail = []

    const distance = Math.random() * 0.6 + 0.4
    this.size = (1 / distance) * (Math.random() * 0.4 + 0.2)
    this.brightness = (1 / distance) * (Math.random() * 0.3 + 0.2)

    this.delay = Math.random() * 5000 + 2000
    this.activeTime = Date.now() + this.delay
  }

  update(canvas: HTMLCanvasElement) {
    if (!canvas) return

    if (Date.now() < this.activeTime) {
      return
    }

    this.trail.push({ x: this.x, y: this.y, opacity: this.opacity })

    if (this.trail.length > 10) {
      this.trail.shift()
    }

    this.x += this.speed * Math.cos(this.angle)
    this.y += this.speed * Math.sin(this.angle)
    this.opacity -= this.fade

    if (this.opacity <= 0 || this.x > canvas.width + 200 || this.y > canvas.height + 200) {
      this.reset(canvas)
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (Date.now() < this.activeTime) {
      return
    }

    const tailX = this.x - this.length * Math.cos(this.angle)
    const tailY = this.y - this.length * Math.sin(this.angle)

    const baseWidth = 3 + Math.random() * 2
    const width = baseWidth * this.size

    const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY)
    const headOpacity = this.opacity * this.brightness
    const middleOpacity = this.opacity * this.brightness * 0.7
    const tailOpacity = this.opacity * this.brightness * 0.2

    gradient.addColorStop(0, `rgba(230, 243, 255, ${headOpacity})`)
    gradient.addColorStop(0.5, `rgba(230, 243, 255, ${middleOpacity})`)
    gradient.addColorStop(1, `rgba(230, 243, 255, ${tailOpacity})`)

    ctx.fillStyle = gradient
    ctx.beginPath()

    const perpX = width * Math.cos(this.angle + Math.PI / 2)
    const perpY = width * Math.sin(this.angle + Math.PI / 2)

    ctx.moveTo(this.x + perpX, this.y + perpY)
    ctx.lineTo(this.x - perpX, this.y - perpY)
    ctx.lineTo(tailX - perpX * 0.5, tailY - perpY * 0.5)
    ctx.lineTo(tailX + perpX * 0.5, tailY + perpY * 0.5)
    ctx.closePath()
    ctx.fill()

    const headSize = 2 * this.size
    ctx.fillStyle = `rgba(255, 255, 255, ${headOpacity})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, headSize, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = `rgba(255, 255, 255, ${headOpacity * 0.3})`
    ctx.lineWidth = this.size
    ctx.beginPath()
    ctx.moveTo(this.x + perpX, this.y + perpY)
    ctx.lineTo(this.x - perpX, this.y - perpY)
    ctx.lineTo(tailX - perpX * 0.5, tailY - perpY * 0.5)
    ctx.lineTo(tailX + perpX * 0.5, tailY + perpY * 0.5)
    ctx.closePath()
    ctx.stroke()
  }
}

const MeteorShower: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const meteorsRef = useRef<Meteor[]>([])
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    meteorsRef.current = []
    for (let i = 0; i < 2; i++) {
      meteorsRef.current.push(new MeteorClass(canvas) as unknown as Meteor)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      meteorsRef.current.forEach((meteor) => {
        ;(meteor as unknown as MeteorClass).update(canvas)
        meteor.draw(ctx)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        background: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 3,
        willChange: 'transform'
      }}
    />
  )
}

const StarrySky: React.FC = () => {
  const [stars, setStars] = React.useState<StarProps[]>([])

  React.useEffect(() => {
    const generateRandomStars = (): StarProps[] => {
      const starTypes: StarType[] = [
        'small-dot',
        'medium-star',
        'large-star',
        'complex-shape',
        'star-1',
        'star-2',
        'star-3',
        'star-4',
        'star-5'
      ]
      const stars: StarProps[] = []

      for (let i = 0; i < 80; i++) {
        stars.push({
          id: `star-${i + 1}`,
          position: {
            x: Math.random() * 100,
            y: Math.random() * 100
          },
          size: Math.random() * 0.5 + 0.5,
          type: starTypes[Math.floor(Math.random() * starTypes.length)],
          glowDelay: Math.random() * 5 + 2,
          glowDuration: 5,
          baseOpacity: Math.random() * 0.2 + 0.5
        })
      }

      return stars
    }

    setStars(generateRandomStars())
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        userSelect: 'none',
        background: 'linear-gradient(135deg, #674b9c 0%, #101028 70%, #12182b 90%, #19202c 100%)',
        zIndex: 1
      }}
    >
      {}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 2
        }}
      >
        <defs>
          <style>
            {`
              .cls-1 {
                fill: #fff;
              }
              
              
              .star-complex-shape {
                fill: #ffffff;
                filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
              }
              
              .star-large-star {
                fill: #fff8e1;
                filter: drop-shadow(0 0 2px rgba(255, 248, 225, 0.7));
              }
              
              .star-medium-star {
                fill: #f0f8ff;
                filter: drop-shadow(0 0 1px rgba(240, 248, 255, 0.5));
              }
              
              .star-small-dot {
                fill: #ffffff;
                filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.4));
              }
              
              .star-individual-1 {
                fill: #ffffff;
                filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.7));
              }
              
              .star-individual-2 {
                fill: #fff8e1;
                filter: drop-shadow(0 0 2px rgba(255, 248, 225, 0.6));
              }
              
              .star-individual-3 {
                fill: #f0f8ff;
                filter: drop-shadow(0 0 1px rgba(240, 248, 255, 0.5));
              }
              
              .star-individual-4 {
                fill: #e6f3ff;
                filter: drop-shadow(0 0 1px rgba(230, 243, 255, 0.4));
              }
              
              .star-individual-5 {
                fill: #fff8e1;
                filter: drop-shadow(0 0 2px rgba(255, 248, 225, 0.8));
              }
              
              
              .star-glow {
                animation: starGlow infinite;
              }
              
              @keyframes starGlow {
                0%, 70% {
                  opacity: var(--base-opacity, 0.7);
                }
                80% {
                  opacity: 1;
                }
                85% {
                  opacity: calc(var(--base-opacity, 0.7) + 0.2);
                }
                90% {
                  opacity: calc(var(--base-opacity, 0.7) + 0.1);
                }
                100% {
                  opacity: var(--base-opacity, 0.7);
                }
              }
            `}
          </style>
        </defs>

        <g>
          <g id="Layer_1">
            <g id="Layer_3">
              <g>
                {}
                {stars.map((star) => (
                  <Star
                    key={star.id}
                    id={star.id}
                    position={star.position}
                    size={star.size}
                    type={star.type}
                    glowDelay={star.glowDelay}
                    glowDuration={star.glowDuration}
                    baseOpacity={star.baseOpacity}
                  />
                ))}
              </g>
            </g>
          </g>
        </g>
      </svg>

      {}
      <MeteorShower />
    </div>
  )
}

export default StarrySky
