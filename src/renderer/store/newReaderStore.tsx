import { create } from 'zustand'
import useGlobalStore from './useGlobalStore'

interface IReaderStore {}
const useReaderStore = create<IReaderStore>((set) => ({}))
